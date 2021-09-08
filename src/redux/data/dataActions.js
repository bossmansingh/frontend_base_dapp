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

export const fetchData = (account) => {
  return async (dispatch) => {
    dispatch(fetchDataRequest());
    try {
<<<<<<< HEAD
      // await store
      //   .getState()
      //   .blockchain.gameContract.methods.setChallengerPlayer()
      //   .call();
      // let accountAddress = await store
      //   .getState()
      //   .blockchain.gameContract.methods.getPlayerAccountBalance()
      //   .call();
      // console.log("AccountAddress: " + accountAddress.toString());
      // dispatch(
      //   fetchDataSuccess({
      //     accountBalance
      //   })
      // );
=======
      let name = await store
        .getState()
        .blockchain.smartContract.methods.name()
        .call();

      dispatch(
        fetchDataSuccess({
          name,
        })
      );
>>>>>>> 894d5c47a54bf99eb188d3f948996214c95dda97
    } catch (err) {
      console.log(err);
      dispatch(fetchDataFailed("Could not load data from contract."));
    }
  };
};
