import { getDateDifferenceInSeconds, getShortGameId, isValidString } from "../../utils/Helpers";
import { createCard, PieceType } from "../../utils/CanvasHelper";
import store from "../store";

const Moralis = require('moralis');
const web3 = new Moralis.Web3();
const fs = require('fs');

export const GameModelDataType = {
  SHORT_ID: 'shortId',
  GAME_FEE: 'gameFee',
  GAME_ENDED: 'gameEnded',
  PLAYER_ADDR: 'playerAddress',
  OPPONENT_ADDR: 'opponentAddress',
  WINNER_ADDR: 'winnerAddress',
  CURRENT_TURN_ADDR: 'currentTurnAddress',
  FEN_STRING: 'fenString',
  GAME_TIME: 'gameTime',
  LIGHT_SQUARE_COLOR: 'lightSquareColor',
  DARK_SQUARE_COLOR: 'darkSquareColor'
};

export const DialogType = {
  INFO: 'info',
  CREATE_GAME: 'create_game',
  JOIN_GAME: 'join_game',
  ENG_GAME: 'end_game',
  NFT_CREATED: 'nft_created',
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

const endGameEvent = () => {
  return {
    type: 'END_GAME'
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

const showNFTCreated = (payload) => {
  return {
    type: 'SHOW_NFT_CREATED_DIALOG',
    payload: payload
  };
};

function getGameModelQuery() {
  return new Moralis.Query(GameModelInstance);
}

async function queryGameModel(shortId) {
  try {
    const query = getGameModelQuery();
    query.equalTo(GameModelDataType.SHORT_ID, shortId);
    query.doesNotExist(GameModelDataType.WINNER_ADDR);
    return await query.first();
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function currentGameOrNull(address, dispatch) {
  try {
    const onGoingGameQuery = getGameModelQuery();
    onGoingGameQuery.doesNotExist(GameModelDataType.WINNER_ADDR);
    onGoingGameQuery.equalTo(GameModelDataType.GAME_ENDED, false);
    const playerAddressMatchQuery = getGameModelQuery();
    playerAddressMatchQuery.equalTo(GameModelDataType.PLAYER_ADDR, address);
    const opponentAddressMatchQuery = getGameModelQuery();
    opponentAddressMatchQuery.equalTo(GameModelDataType.OPPONENT_ADDR, address);
    const mainQuery = Moralis.Query.and(
      Moralis.Query.or(
        playerAddressMatchQuery, 
        opponentAddressMatchQuery
      ),
      onGoingGameQuery
    );
    const gameModel = await mainQuery.first();
    if (gameModel != null) {
      dispatch(updateGame({gameModel: gameModel, missedTurnCount: 0}));
      await addSubscription(dispatch, gameModel.get(GameModelDataType.SHORT_ID));
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
    const gameModel = new GameModelInstance();
    gameModel.set(GameModelDataType.GAME_FEE, gameFee);
    gameModel.set(GameModelDataType.GAME_ENDED, false);
    gameModel.set(GameModelDataType.PLAYER_ADDR, address);
    gameModel.set(GameModelDataType.FEN_STRING, 'start');
    gameModel.set(GameModelDataType.LIGHT_SQUARE_COLOR, lightSquareColor);
    gameModel.set(GameModelDataType.DARK_SQUARE_COLOR, darkSquareColor);
    const result = await gameModel.save();
    return result;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function addSubscription(dispatch, gameShortId) {
  const gameModelQuery = getGameModelQuery();
  gameModelQuery.equalTo(GameModelDataType.SHORT_ID, gameShortId);
  const subscription = await gameModelQuery.subscribe();
  subscription.on('update', (gameModel) => {
    dispatch(updateGame({gameModel: gameModel}));
    if (gameModel.get(GameModelDataType.GAME_ENDED) && isValidString(gameModel.get(GameModelDataType.WINNER_ADDR))) {
      dispatch(endGameEvent());
      subscription.unsubscribe();
    }
  });
  subscription.on('close', async (event) => {
    console.log('subscription closed');
    console.table(event);
    await endGameFun({gameShortId: gameShortId});
  });
}

export const createNFTImage = ({winnerAddress, otherAddress, chessboard}) => {
  return async (dispatch) => {
    try {
      console.log('create NFT');
      const fileName = await createCard({
        winnerAddress: winnerAddress,
        otherAddress: otherAddress,
        pieceType: PieceType.KNIGHT,
        chessboard: chessboard
      });
      // const image = fs.readFileSync(`${cardsFolderPath}/${fileName}`);
      //console.log(`image: ${fileName}`);
      dispatch(showNFTCreated({image: fileName}));
    } catch (err) {
      console.log(err);
    }
  };
};

export const togglePlayerState = ({gameModel, address, fenString, missedTurnCount}) => {
  return async (dispatch) => {
    // Update game data when turn switches to other player
    console.log(`missedTurnCount: ${missedTurnCount}`);
    if (fenString != null && fenString !== "") {
      gameModel.set(GameModelDataType.FEN_STRING, fenString);
    }
    gameModel.set(GameModelDataType.CURRENT_TURN_ADDR, address);
    dispatch(updateGame({missedTurnCount: missedTurnCount}));
    await gameModel.save();
  };
};

export const createGame = ({gameFee, address, lightSquareColor, darkSquareColor}) => {
  return async (dispatch) => {
    try {
      // Save new game to database
      const gameModel = await saveNewGameToDatabase({
        gameFee: gameFee,
        address: address,
        lightSquareColor: lightSquareColor, 
        darkSquareColor: darkSquareColor
      });
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
                const gameShortId = getShortGameId(gameId);
                gameModel.set(GameModelDataType.SHORT_ID, getShortGameId(gameId));
                await gameModel.save();
                dispatch(createNewGame({gameModel: gameModel})); 
                await addSubscription(dispatch, gameShortId);
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

export const joinGame = ({shortId, address}) => {
  return async (dispatch) => {
    try {
      // Query game from database
      const gameModel = await queryGameModel(shortId);
      if (gameModel != null) {
        const gameFee = gameModel.get(GameModelDataType.GAME_FEE);
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
              const playerAddress = gameModel.get(GameModelDataType.PLAYER_ADDR);
              gameModel.set(GameModelDataType.OPPONENT_ADDR, address);
              gameModel.set(GameModelDataType.CURRENT_TURN_ADDR, playerAddress);
              await gameModel.save();
              dispatch(joinNewGame({gameModel: gameModel})); 
              await addSubscription(dispatch, shortId);
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

export async function endGameFun({gameShortId, winnerAddress}) {
  const gameModel = await queryGameModel(gameShortId);
  if (gameModel != null) {
    const currentTime = new Date();
    const gameTime = getDateDifferenceInSeconds(currentTime, gameModel.createdAt);
    //const checkSumAddress = web3.utils.toChecksumAddress(winnerAddress);
    console.log(`gameTime: ${gameTime}`);
    //console.log(`checkSumAddress: ${checkSumAddress}`);
    
    if (isValidString(winnerAddress)) {
      console.log(`winnerAddress: ${winnerAddress}`);
      gameModel.set(GameModelDataType.WINNER_ADDR, winnerAddress);
    }
    gameModel.set(GameModelDataType.GAME_TIME, gameTime);
    gameModel.set(GameModelDataType.GAME_ENDED, true);
    await gameModel.save();
  }
}

export const endGame = ({gameShortId, winnerAddress}) => {
  return async (dispatch) => {
    try {
      await endGameFun(gameShortId, winnerAddress);
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
