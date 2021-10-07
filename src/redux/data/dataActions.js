import { isValidString } from "../../utils/Helpers";
import store from "../store";

const Moralis = require('moralis');
const web3 = new Moralis.Web3();

export const DialogType = {
  INFO: 'info',
  CREATE_GAME: 'create_game',
  JOIN_GAME: 'join_game',
  NONE: 'none'
};

const GameModelInstance = Moralis.Object.extend('GameModel');

const fetchDataRequest = () => {
  return {
    type: "CHECK_DATA_REQUEST",
  };
};

const fetchDataFailed = (payload) => {
  return {
    type: "CHECK_DATA_FAILED",
    payload: payload,
  };
};

const createNewGame = (payload) => {
  return {
    type: "CREATE_GAME",
    payload: payload
  };
};

const joinNewGame = (payload) => {
  return {
    type: "JOIN_GAME",
    payload: payload
  };
};

const updateGame = (payload) => {
  return {
    type: "UPDATE_GAME",
    payload: payload
  };
};

const updateBaseGameFee = (payload) => {
  return {
    type: 'UPDATE_BASE_GAME_FEE',
    payload: payload
  };
};

export const clearGameData = () => {
  return {
    type: "CLEAR_GAME_DATA"
  };
};

function getGameModelQuery() {
  return new Moralis.Query(GameModelInstance);
}

async function queryGameModel(gameId) {
  try {
    const query = getGameModelQuery();
    query.equalTo('gameId', gameId.toString());
    const gameModel = await query.first();
    console.table(gameModel);
    return gameModel;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function saveNewGameToDatabase(payload) {
  try {
    const gameFee = payload.gameFee;
    const address = payload.address;
    const lightSquareColor = payload.lightSquareColor;
    const darkSquareColor = payload.darkSquareColor;
    const gameModel = new GameModelInstance();
    console.table(gameModel);
    const result = await gameModel.save({
      gameFee: gameFee,
      playerAddress: address,
      opponentAddress: '',
      winnerAddress: '',
      gameStarted: false,
      gameEnded: false,
      fenString: 'start',
      gameCreateTime: 0,
      lastTurnTime: 0,
      currentTurnAddress: '',
      lightSquareColor: lightSquareColor,
      darkSquareColor: darkSquareColor
    });
    return result;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function addSubscription(dispatch, gameId) {
  const subscriptionQuery = getGameModelQuery();
  subscriptionQuery.equalTo('gameId', gameId.toString());
  const subscription = await subscriptionQuery.subscribe();
  subscription.on('update', (gameModel) => {
    dispatch(updateGame({gameModel: gameModel}));
  });
}

async function removeSubscription(gameId) {
  const subscriptionQuery = getGameModelQuery();
  subscriptionQuery.equalTo('gameId', gameId.toString());
  await subscriptionQuery.unsubscribe();
  // This will close the WebSocket connection to the LiveQuery server, cancel the auto-reconnect, and unsubscribe all subscriptions based on it.
  Moralis.LiveQuery.close();
}

export const showInfoDialog = () => {
  return {
    type: 'SHOW_INFO_DIALOG'
  };
};

export const showJoinGameDialog = () => {
  return {
    type: 'SHOW_JOIN_GAME_DIALOG'
  };
};

export const showCreateGameDialog = () => {
  return {
    type: 'SHOW_CREATE_GAME_DIALOG'
  };
};

export const hideDialog = () => {
  return {
    type: 'HIDE_DIALOG'
  };
};

export const togglePlayerState = (payload) => {
  return async (dispatch) => {
    // Update game data when turn switches to other player
    const gameModel = payload.gameModel;
    const address = payload.address;
    const fenString = payload.fen;
    if (fenString != null && fenString !== "") {
      gameModel.set('fenString', fenString);
    }
    gameModel.set('currentTurnAddress', address);
    const result = await gameModel.save();
    dispatch(updateGame({gameModel: result}));
  };
};

export const createGame = (payload) => {
  return async (dispatch) => {
    try {
      const gameFee = payload.gameFee;
      const address = payload.address;
      const lightSquareColor = payload.lightSquareColor;
      const darkSquareColor = payload.darkSquareColor;
      // Save new game to database
      const gameModel = await saveNewGameToDatabase({
        gameFee: gameFee,
        address: address,
        lightSquareColor: lightSquareColor, 
        darkSquareColor: darkSquareColor
      });
      console.table('GameModel', gameModel);
      if (gameModel != null) {
        await store
              .getState()
              .blockchain.gameContract.methods.createGame(gameModel.id)
              .send({
                from: address,
                value: web3.utils.toWei(gameFee, 'ether')
              }).once('error', async (err) => {
                console.log(err);
                dispatch(fetchDataFailed('Error creating a new game'));
                // Delete saved game model from database
                await gameModel.destroy();
              }).then(async (receipt) => {
                //console.log("Game Create Success", receipt);
                dispatch(createNewGame({gameModel: gameModel})); 
                await addSubscription(dispatch, gameModel.id);
              });
      } else {
        dispatch(fetchDataFailed('Error creating a new game'));
      }
    } catch (err) {
      console.log(err);
      dispatch(fetchDataFailed('Error creating a new game'));
    }
  };
};

export const joinGame = (payload) => {
  return async (dispatch) => {
    try {
      // Query game from database
      const gameId = payload.gameId;
      const address = payload.address;
      const gameModel = await queryGameModel(gameId, address);
      const gameFee = gameModel.get('gameFee');
      if (gameModel != null) {
        await store
            .getState()
            .blockchain.gameContract.methods.joinGame(gameId)
            .send({
              from: address,
              value: web3.utils.toWei(gameFee, 'ether')
            }).once("error", (err) => {
              console.log(err);
              dispatch(fetchDataFailed(`Error joining game with code: ${gameId}`));
            }).then(async (receipt) => {
              //console.log("Game Joined Success", receipt);
              console.table(gameModel);
              // Update game data after opponent joins
              const playerAddress = gameModel.get('playerAddress');
              gameModel.set('opponentAddress', address);
              gameModel.set('gameStarted', true);
              gameModel.set('currentTurnAddress', playerAddress);
              await gameModel.save();
              dispatch(joinNewGame({gameModel: gameModel})); 
              await addSubscription(dispatch, gameId);
            });
      } else {
        dispatch(showJoinGameDialog());
        dispatch(fetchDataFailed('Either the game does not exists or some network error occurred.'));
      }
    } catch (err) {
      console.log(err);
      dispatch(showJoinGameDialog());
      dispatch(fetchDataFailed('Error joining the game'));
    }
  };
};

export const endGame = (gameId, address) => {
  return async () => {
    await removeSubscription(gameId);
  };
};

export const fetchData = (account) => {
  return async (dispatch) => {
    dispatch(fetchDataRequest());
    try {
      const contractBalance = await store
        .getState()
        .blockchain.gameContract.methods.getContractBalance()
        .call();
      const baseGameFee = await store
        .getState()
        .blockchain.gameContract.methods.getBaseGameFee()
        .call();
      if (isValidString(contractBalance)) {
        const balanceInEth = web3.utils.fromWei(contractBalance, 'ether');
        console.log(`Contract balance in ETH: ${balanceInEth}`);
      }
      if (isValidString(baseGameFee)) {
        const baseGameFeeInEth = web3.utils.fromWei(baseGameFee, 'ether');
        console.log(`Base game fee in ETH: ${baseGameFeeInEth}`);
        dispatch(updateBaseGameFee(baseGameFeeInEth));
      }
    } catch (err) {
      console.log(err);
      dispatch(fetchDataFailed('Could not load data from contract.'));
    }
  };
};
