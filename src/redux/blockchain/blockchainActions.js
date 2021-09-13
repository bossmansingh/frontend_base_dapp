// constants
import Web3 from "web3";
import GameContract from "../../contracts/GameContract.json";

// log
import { fetchData } from "../data/dataActions";

const Moralis = require('moralis');

Moralis.initialize("1NlwHTGcv2MI4dC4T5Z0jpDQrXj2vaCj4Fnzs5ZQ");
Moralis.serverURL = "https://hgqfneavzzl0.bigmoralis.com:2053/server";

const connectRequest = () => {
  return {
    type: "CONNECTION_REQUEST",
  };
};

const connectSuccess = (payload) => {
  return {
    type: "CONNECTION_SUCCESS",
    payload: payload,
  };
};

const connectFailed = (payload) => {
  return {
    type: "CONNECTION_FAILED",
    payload: payload,
  };
};

const updateAccountRequest = (payload) => {
  return {
    type: "UPDATE_ACCOUNT",
    payload: payload,
  };
};

export const moralisAuthenticate = () => {
  return async (dispatch) => {
    dispatch(connectRequest());
    try {
      let user = await Moralis.User.current();
      if (!user) {
        user = await Moralis.Web3.authenticate();
      }
      console.log(user);
      dispatch(
        connectSuccess({
          account: user
        })
      );
    } catch (error) {
      console.log(error);
    }
  };
};

export const connect = () => {
  return async (dispatch) => {
    dispatch(connectRequest());
    if (window.ethereum) {
      let web3 = new Web3(window.ethereum);
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const networkId = await window.ethereum.request({
          method: "net_version",
        });
        console.log("NetworkId: " + networkId);
        const networkData = await GameContract.networks[networkId];
        if (networkData) {
          const gameContractObj = new web3.eth.Contract(
            GameContract.abi,
            networkData.address
          );
          dispatch(
            connectSuccess({
              account: accounts[0],
              gameContract: gameContractObj,
              web3: web3,
            })
          );
          // Add listeners start
          window.ethereum.on("accountsChanged", (accounts) => {
            dispatch(updateAccount(accounts[0]));
          });
          window.ethereum.on("chainChanged", () => {
            window.location.reload();
          });
          // Add listeners end
        } else {
          dispatch(connectFailed("Change network to CHKMATE."));
        }
      } catch (err) {
        dispatch(connectFailed("Something went wrong."));
      }
    } else {
      dispatch(connectFailed("Install Metamask."));
    }
  };
};

export const updateAccount = (account) => {
  return async (dispatch) => {
    dispatch(updateAccountRequest({ account: account }));
    dispatch(fetchData(account));
  };
};
