import web3 from "web3";
import store from "../store";

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
            }).then((receipt) => {
              console.log("Game Create Success", receipt);
              const challengerAddress = receipt.events["GameCreated"]["returnValues"]["challengerAddress"];
              const gameId = receipt.events["GameCreated"]["returnValues"]["gameId"];
              console.log("GameId: ", gameId);
              dispatch(createNewGame({
                gameId: gameId,
                challenger: challengerAddress,
              }));
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
          }).then((receipt) => {
            console.log("Game Joined Success", receipt);
            const challengerAddress = receipt.events["GameJoined"]["returnValues"]["challengerAddress"];
            const challengeAcceptorAddress = receipt.events["GameJoined"]["returnValues"]["challengeAcceptorAddress"];
            const joinedGameId = receipt.events["GameJoined"]["returnValues"]["gameId"];
            console.log("challengerAddress: ", challengerAddress);
            console.log("challengeAcceptorAddress: ", challengeAcceptorAddress);
            console.log("joinedGameId: ", joinedGameId);
            dispatch(joinNewGame({
              gameId: joinedGameId,
              challenger: challengerAddress,
              challengAcceptor: challengeAcceptorAddress
            }));
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
      console.log("Contract balance: ", web3.utils.fromWei(contractBalance, "ether"));
    } catch (err) {
      console.log(err);
      dispatch(fetchDataFailed("Could not load data from contract."));
    }
  };
};
