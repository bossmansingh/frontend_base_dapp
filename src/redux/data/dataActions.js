import web3 from "web3";
import store from "../store";
import { GameModel } from "./dataReducer";

const Moralis = require('moralis');

const fetchDataRequest = () => {
  return {
    type: "CHECK_DATA_REQUEST",
  };
};

const fetchDataSuccess = (payload) => {
  return {
    type: "CHECK_DATA_SUCCESS",
    payload: payload,
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

async function queryGameModel(dispatch, gameId, address) {
  try {
    const gameModel = Moralis.Object.extend("GameModel");
    const query = new Moralis.Query(gameModel);
    query.equalTo("gameId", gameId);
    const resultObj = await query.first();
    const playerAddress = resultObj.get("playerAddress");
    console.log("Game fetched:");
    console.table(resultObj);
    const saveResult = await resultObj.save({
      opponentAddress: address,
      gameStarted: true,
      currentTurnAddress: playerAddress
    });
    dispatch(joinNewGame({gameModel: saveResult})); 
  } catch (err) {
    console.log("Join Game error");
    console.log(err);
    dispatch(fetchDataFailed("Error joining new game"));
  }
}

async function saveNewGame(dispatch, gameId, address) {
  try {
    console.log("Saving game");
    const GameModel = Moralis.Object.extend("GameModel");
    const gameModel = new GameModel();
    console.table(gameModel);
    const result = await gameModel.save({
      gameId: gameId,
      playerAddress: address,
      opponentAddress: "",
      winnerAddress: "",
      gameStarted: false,
      gameEnded: false,
      moves: "",
      gameCreateTime: 0,
      lastTurnTime: 0,
      currentTurnAddress: ""
    });
    console.log("Game saved");
    console.table(result);
    dispatch(createNewGame({gameModel: result})); 
  } catch (err) {
    console.log("Game save error");
    console.log(err);
    dispatch(fetchDataFailed("Error saving new game"));
  }
}

export const toggleInfoDialog = (payload) => {
  return {
    type: "TOGGLE_INFO_DIALOG",
    payload: payload
  };
};

export const toggleJoinGameDialog = (payload) => {
  return {
    type: "TOGGLE_JOIN_GAME_DIALOG",
    payload: payload
  };
};

export const createGame = (address) => {
  return async (dispatch) => {
    try {
      console.log("Create game");
      console.log("Challenger Address: ", address);
      await store
            .getState()
            .blockchain.gameContract.methods.createGame()
            .send({
              from: address,
              value: web3.utils.toWei("0.05", "ether")
            }).once("error", (err) => {
              console.log(err);
              dispatch(fetchDataFailed("Error creating a new game"));
            }).then(async (receipt) => {
              console.log("Game Create Success", receipt);
              const challengerAddress = receipt.events["GameCreated"]["returnValues"]["challengerAddress"];
              const gameId = receipt.events["GameCreated"]["returnValues"]["gameId"];
              console.log("GameId: ", gameId);

              // Save new game to database
              await saveNewGame(dispatch, gameId, challengerAddress);
            });
    } catch (err) {
      console.log(err);
      dispatch(fetchDataFailed("Error creating a new game"));
    }
  };
};

export const joinGame = (address, gameId) => {
  return async (dispatch) => {
    try {
      console.log("Join game request");
      console.log("Challenge acceptor address: ", address);
      console.log("GameId: ", gameId);
      await store
          .getState()
          .blockchain.gameContract.methods.joinGame(gameId)
          .send({
            from: address,
            value: web3.utils.toWei("0.05", "ether")
          }).once("error", (err) => {
            console.log(err);
            dispatch(fetchDataFailed("Error joining game with gameId: " + gameId));
          }).then(async (receipt) => {
            console.log("Game Joined Success", receipt);
            const challengerAddress = receipt.events["GameJoined"]["returnValues"]["challengerAddress"];
            const challengeAcceptorAddress = receipt.events["GameJoined"]["returnValues"]["challengeAcceptorAddress"];
            const joinedGameId = receipt.events["GameJoined"]["returnValues"]["gameId"];
            console.log("challengerAddress: ", challengerAddress);
            console.log("challengeAcceptorAddress: ", challengeAcceptorAddress);
            console.log("joinedGameId: ", joinedGameId);

            // Query game from database
            await queryGameModel(dispatch, gameId, challengeAcceptorAddress);
          });
    } catch (err) {
      console.log(err);
      dispatch(fetchDataFailed("Error joining the game"));
      dispatch(toggleJoinGameDialog(true));
    }
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
        if (contractBalance !== null) {
          const balanceInEth = web3.utils.fromWei(contractBalance, "ether");
          console.log("Contract balance in ETH: ", balanceInEth);
        }
    } catch (err) {
      console.log(err);
      dispatch(fetchDataFailed("Could not load data from contract."));
    }
  };
};
