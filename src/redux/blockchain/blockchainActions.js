// constants
import Web3 from "web3";
import GameContract from "../../contracts/GameContract.json";
import blockies from "../../utils/Blockies";
import { fetchData } from "../data/dataActions";

const Moralis = require('moralis');

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

const updateIdenticon = (account) => {
  return async (dispatch) => {
    const web3 = new Web3(window.ethereum);
    const address = account.get("ethAddress");
    const identiconUrl = blockies.create({
      seed: address,
      size: 10,
      scale: 16
    }).toDataURL();
    const networkId = await window.ethereum.request({
      method: "net_version",
    });
    const networkData = await GameContract.networks[networkId];
    if (networkData) {
      const gameContractObj = new web3.eth.Contract(
        GameContract.abi,
        networkData.address
      );
      dispatch(
        connectSuccess({
          address: address,
          identiconUrl: identiconUrl,
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
  };
};

export const initAccount = () => {
  return async (dispatch) => {
    if (window.ethereum) {
      let userAccount = await Moralis.User.current();
      if (userAccount) {
        dispatch(updateIdenticon(userAccount));
      }
    }
  };
};
export const connect = () => {
  return async (dispatch) => {
    dispatch(connectRequest());
    if (window.ethereum) {
      try {
        const userAccount = await Moralis.Web3.authenticate();
        dispatch(updateIdenticon(userAccount));
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
