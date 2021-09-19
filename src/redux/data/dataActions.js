// log
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

export const joinGame = (payload) => {
  return async (dispatch) => {
    try {
      const success = await store
          .getState()
          .blockchain.gameContract.methods.joinGame(payload)
          .call();
      dispatch(
        fetchDataSuccess({
          success
        })
      );
    } catch (err) {
      console.log(err);
      dispatch(fetchDataFailed("Error joing the game"));
      dispatch(toggleJoinGameDialog(true));
    }
  };
};

export const fetchData = (account) => {
  return async (dispatch) => {
    dispatch(fetchDataRequest());
    try {
      // const contractBalance = await store
      //   .getState()
      //   .blockchain.gameContract.methods.getContractBalance()
      //   .call();
      // dispatch(
      //   fetchDataSuccess({
      //     contractBalance
      //   })
      // );
    } catch (err) {
      console.log(err);
      dispatch(fetchDataFailed("Could not load data from contract."));
    }
  };
};
