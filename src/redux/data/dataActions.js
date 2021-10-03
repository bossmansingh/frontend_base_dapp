import web3 from "web3";
import store from "../store";

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

function getGameModelQuery() {
  const gameModel = Moralis.Object.extend("GameModel");
  return new Moralis.Query(gameModel);
}

async function queryGameModel(gameId, address) {
  try {
    console.log("Fetch game from database");
    const query = getGameModelQuery();
    console.log("GameId: " + gameId);
    query.equalTo("gameId", gameId.toString());
    const gameModel = await query.first();
    console.log("Game fetched:");
    console.table(gameModel);
    const playerAddress = gameModel.get("playerAddress");
    gameModel.set("opponentAddress", address);
    gameModel.set("gameStarted", true);
    gameModel.set("currentTurnAddress", playerAddress);
    return await gameModel.save();
  } catch (err) {
    console.log("Query Game error");
    console.log(err);
    return null;
  }
}

async function saveNewGameToDatabase(gameId, address) {
  try {
    console.log("Saving game to database");
    const GameModel = Moralis.Object.extend("GameModel");
    const gameModel = new GameModel();
    console.table(gameModel);
    const result = await gameModel.save({
      gameId: gameId.toString(),
      playerAddress: address,
      opponentAddress: "",
      winnerAddress: "",
      gameStarted: false,
      gameEnded: false,
      currentBoardPosition: "start",
      gameCreateTime: 0,
      lastTurnTime: 0,
      currentTurnAddress: ""
    });
    console.log("Game saved");
    console.table(result);
    return result;
  } catch (err) {
    console.log("Game save error");
    console.log(err);
    return null;
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
      // Save new game to database
      const currentGameCounter = await getGameModelQuery().count();
      const gameModel = await saveNewGameToDatabase(currentGameCounter, address);
      if (gameModel != null) {
        console.log("Create and add new game to blockchain");
        await store
              .getState()
              .blockchain.gameContract.methods.createGame()
              .send({
                from: address,
                value: web3.utils.toWei("0.05", "ether")
              }).once("error", async (err) => {
                console.log(err);
                dispatch(fetchDataFailed("Error creating a new game"));
                // Delete saved game model from database
                const deleteSuccess = await gameModel.destroy();
                console.log("DeleteSuccess: ", deleteSuccess);
              }).then(async (receipt) => {
                console.log("Game Create Success", receipt);
                dispatch(createNewGame({gameModel: gameModel})); 
                // TODO: Add subscription to game object on database for currentGameCounter
              });
      } else {
        dispatch(fetchDataFailed("Error creating a new game"));
      }
    } catch (err) {
      console.log(err);
      dispatch(fetchDataFailed("Error creating a new game"));
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
      if (gameModel != null) {
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
              console.table(gameModel);
              dispatch(joinNewGame({gameModel: gameModel})); 
              // TODO: Add subscription to game object on database for gameId
            });
      } else {
        dispatch(fetchDataFailed("Either the game does not exists or some network error occurred."));
        dispatch(toggleJoinGameDialog(true));
      }
    } catch (err) {
      console.log(err);
      dispatch(fetchDataFailed("Error joining the game"));
      dispatch(toggleJoinGameDialog(true));
    }
  };
};

export const endGame = (gameId, address) => {
  return () => {
    // TODO: Remove subscription from game object on database for gameId
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
