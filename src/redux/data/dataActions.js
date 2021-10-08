import { getShortGameId, isValidString } from "../../utils/Helpers";
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

export const fetchDataFailed = (payload) => {
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

function getGameModelQuery() {
  return new Moralis.Query(GameModelInstance);
}

async function queryGameModel(shortId) {
  try {
    const query = getGameModelQuery();
    query.equalTo('shortId', shortId);
    const gameModel = await query.first();
    console.table(gameModel);
    return gameModel;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function currentGameOrNull(address, dispatch) {
  try {
    const onGoingGameQuery = getGameModelQuery();
    onGoingGameQuery.equalTo('gameEnded', false);
    const playerAddressMatchQuery = getGameModelQuery();
    playerAddressMatchQuery.equalTo('playerAddress', address);
    const opponentAddressMatchQuery = getGameModelQuery();
    opponentAddressMatchQuery.equalTo('opponentAddress', address);
    const mainQuery = Moralis.Query.and(
      Moralis.Query.or(
        playerAddressMatchQuery, 
        opponentAddressMatchQuery
      ),
      onGoingGameQuery
    );
    const gameModel = await mainQuery.first();
    if (gameModel != null) {
      dispatch(updateGame({gameModel: gameModel}));
      await addSubscription(dispatch, gameModel.id);
    }
  } catch (err) {
    console.log(err);
  }
}

async function saveNewGameToDatabase(payload) {
  try {
    const gameFee = payload.gameFee;
    const address = payload.address;
    const lightSquareColor = payload.lightSquareColor;
    const darkSquareColor = payload.darkSquareColor;
    const gameBoard = payload.gameBoard;
    const gameModel = new GameModelInstance();
    console.table(gameModel);
    const result = await gameModel.save({
      gameFee: gameFee,
      playerAddress: address,
      gameStarted: false,
      gameEnded: false,
      fenString: 'start',
      lightSquareColor: lightSquareColor,
      darkSquareColor: darkSquareColor,
      gameBoard: gameBoard
    });
    return result;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function addSubscription(dispatch, gameId) {
  const subscriptionQuery = getGameModelQuery();
  subscriptionQuery.get(gameId);
  const subscription = await subscriptionQuery.subscribe();
  subscription.on('update', (gameModel) => {
    dispatch(updateGame({gameModel: gameModel}));
  });
}

async function removeSubscription(gameId) {
  const subscriptionQuery = getGameModelQuery();
  subscriptionQuery.get(gameId);
  await subscriptionQuery.unsubscribe();
  // This will close the WebSocket connection to the LiveQuery server, cancel the auto-reconnect, and unsubscribe all subscriptions based on it.
  Moralis.LiveQuery.close();
}

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
      const gameBoard = payload.gameBoard;
      // Save new game to database
      const gameModel = await saveNewGameToDatabase({
        gameFee: gameFee,
        address: address,
        lightSquareColor: lightSquareColor, 
        darkSquareColor: darkSquareColor,
        gameBoard: gameBoard
      });
      console.table('GameModel', gameModel);
      if (gameModel != null) {
        const gameId = gameModel.id;
        await store
              .getState()
              .blockchain.gameContract.methods.createGame(gameId)
              .send({
                from: address,
                value: web3.utils.toWei(gameFee, 'ether')
              }).once('error', async (err) => {
                console.log(err);
                dispatch(fetchDataFailed('Error creating a new game'));
                // Delete saved game model from database
                await gameModel.destroy();
              }).then(async (receipt) => {
                gameModel.set('shortId', getShortGameId(gameId));
                await gameModel.save();
                dispatch(createNewGame({gameModel: gameModel})); 
                await addSubscription(dispatch, gameId);
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
      const shortId = payload.gameId;
      const address = payload.address;
      const gameModel = await queryGameModel(shortId);
      if (gameModel != null) {
        const gameFee = gameModel.get('gameFee');
        const gameId = gameModel.id;
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

export const endGame = (gameShortId, address) => {
  return async (dispatch) => {
    try {
      const gameModel = await queryGameModel(gameShortId);
      if (gameModel != null) {
        const gameId = gameModel.id;
        const currentTime = new Date();
        const gameTime = currentTime - gameModel.createdAt;
        await store
          .getState()
          .blockchain.gameContract.methods.endGame(gameId, address, gameTime)
          .call()
          .once('error', (err) => {
            console.log(err);
            // TODO: Handle error case
          }).then(async (receipt) => {
            console.table(gameModel);
            gameModel.set('winnerAddress', address);
            gameModel.set('gameEnded', true);
            gameModel.set('gameTime', gameTime);
            await gameModel.save();
            //dispatch(showNFTDialog());
            await removeSubscription(gameShortId);
          });
      }
    } catch (err) {
      console.log(err);
      // TODO: Handle error case
    }
  };
};

export const fetchData = (address) => {
  return async (dispatch) => {
    //dispatch(fetchDataRequest());
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
      await currentGameOrNull(address, dispatch);
    } catch (err) {
      console.log(err);
      dispatch(fetchDataFailed('Could not load data from contract.'));
    }
  };
};
