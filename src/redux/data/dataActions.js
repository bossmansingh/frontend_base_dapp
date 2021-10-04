import web3 from "web3";
import store from "../store";

const Moralis = require('moralis');

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

export const clearGameData = () => {
  return {
    type: "CLEAR_GAME_DATA"
  };
};

function getGameModelQuery() {
  const gameModel = Moralis.Object.extend("GameModel");
  return new Moralis.Query(gameModel);
}

async function queryGameModel(gameId) {
  try {
    const query = getGameModelQuery();
    query.equalTo("gameId", gameId.toString());
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
    const gameId = payload.gameId;
    const address = payload.address;
    const lightSquareColor = payload.lightSquareColor;
    const darkSquareColor = payload.darkSquareColor;
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
      currentTurnAddress: "",
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
  subscriptionQuery.equalTo("gameId", gameId.toString());
  const subscription = await subscriptionQuery.subscribe();
  subscription.on("update", (gameModel) => {
    dispatch(updateGame({gameModel: gameModel}));
  });
}

async function removeSubscription(gameId) {
  const subscriptionQuery = getGameModelQuery();
  subscriptionQuery.equalTo("gameId", gameId.toString());
  await subscriptionQuery.unsubscribe();
  // This will close the WebSocket connection to the LiveQuery server, cancel the auto-reconnect, and unsubscribe all subscriptions based on it.
  Moralis.LiveQuery.close();
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

export const togglePlayerState = (payload) => {
  return async (dispatch) => {
    // Update game data when turn switches to other player
    const gameModel = payload.gameModel;
    const address = payload.address;
    gameModel.set("currentTurnAddress", address);
    const result = await gameModel.save();
    dispatch(updateGame({gameModel: result}));
  };
};

export const createGame = (payload) => {
  return async (dispatch) => {
    try {
      const address = payload.address;
      const lightSquareColor = payload.lightSquareColor;
      const darkSquareColor = payload.darkSquareColor;
      // Save new game to database
      const currentGameCounter = await getGameModelQuery().count();
      const gameModel = await saveNewGameToDatabase({
        gameId: currentGameCounter, 
        address: address, 
        lightSquareColor: lightSquareColor, 
        darkSquareColor: darkSquareColor
      });
      if (gameModel != null) {
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
                await gameModel.destroy();
              }).then(async (receipt) => {
                //console.log("Game Create Success", receipt);
                dispatch(createNewGame({gameModel: gameModel})); 
                await addSubscription(dispatch, currentGameCounter);
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
        await store
            .getState()
            .blockchain.gameContract.methods.joinGame(gameId)
            .send({
              from: address,
              value: web3.utils.toWei("0.05", "ether")
            }).once("error", (err) => {
              console.log(err);
              dispatch(fetchDataFailed("Error joining game with code: " + gameId));
            }).then(async (receipt) => {
              //console.log("Game Joined Success", receipt);
              console.table(gameModel);
              // Update game data after opponent joins
              const playerAddress = gameModel.get("playerAddress");
              gameModel.set("opponentAddress", address);
              gameModel.set("gameStarted", true);
              gameModel.set("currentTurnAddress", playerAddress);
              await gameModel.save();
              dispatch(joinNewGame({gameModel: gameModel})); 
              await addSubscription(dispatch, gameId);
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
