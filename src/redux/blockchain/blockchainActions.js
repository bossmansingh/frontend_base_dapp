// constants
import Web3 from "web3";
import GameContract from "../../contracts/GameContract.json";
import blockies from "../../utils/Blockies";
import { createGame, joinGame } from "../data/dataActions";

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

async function isWeb3Active() {
  return await Moralis.ensureWeb3IsInstalled;
}

async function isMetaMaskInstalled() {
  return await Moralis.isMetaMaskInstalled;
}

const getIdenticonUrl = (address) => {
  console.log("Get identicon for address: " + address);
  return blockies.create({
    seed: address,
    size: 8,
    scale: 5
  }).toDataURL();
};

const connectGameAndListener = (address, createGameRequest, joinGameRequest, gameId) => {
  return async (dispatch) => {
    console.table("2 address: ", address);
    console.log("createGameRequest: " + createGameRequest);
    console.log("joinGameRequest: " + joinGameRequest);
    console.log("gameId: " + gameId);
    const identiconUrl = getIdenticonUrl(address);
    // Init Contract
    const web3 = await Moralis.enable();
    const networkId = await window.ethereum.request({
      method: "net_version",
    });
    const networkData = await GameContract.networks[networkId];
    if (networkData) {
      const gameContractObj = new web3.eth.Contract(
        GameContract.abi,   // Will be replaced with actual contract ABI once deployed
        networkData.address // Will be replaced with actual contract address once deployed
      );
      dispatch(
        connectSuccess({
          address: address,
          identiconUrl: identiconUrl,
          gameContract: gameContractObj,
          web3: web3,
        })
      );
      if (createGameRequest) {
        console.log("Create game request");
        dispatch(createGame(address));
      } else if (joinGameRequest && gameId != null && gameId !== "") {
        console.log("Join game request");
        dispatch(joinGame(address, gameId));
      }
    } else {
      dispatch(connectFailed("Change network to CHKMATE."));
      dispatch(
        connectSuccess({
          address: address,
          identiconUrl: identiconUrl,
          web3: web3,
        })
      );
    }
  };
};

export const connectWallet = (createGameRequest, joinGameRequest, gameId) => {
  return async (dispatch) => {
    if (isMetaMaskInstalled()) {
      try {
        dispatch(connectRequest());
        const userAccount = await Moralis.Web3.authenticate({signingMessage: "Sign into CHKMATE"});
        if (userAccount != null) {
          const address = userAccount.get("ethAddress");
          dispatch(connectGameAndListener(address, createGameRequest, joinGameRequest, gameId));
          // Add listeners start
          Moralis.onAccountsChanged(async (accounts) => {
            const newAddress = accounts[0];
            console.log("NewAddress: " + newAddress);
            try {
              await Moralis.link(newAddress);
              dispatch(
                connectSuccess({
                  address: newAddress,
                  identiconUrl: getIdenticonUrl(newAddress),
                })
              );
            } catch (err) {
              console.log(err);
              dispatch(
                connectFailed("Error linking account")
              );
            }
          });
          Moralis.onChainChanged(() => {
            console.log("Chain changed");
            window.location.reload();
          });
        }
      } catch (err) {
        dispatch(connectFailed("Something went wrong."));
      }
    } else {
      dispatch(connectFailed("Install Metamask."));
    }
  };
};

export const logout = () => {
  return async (dispatch) => {
    if (isWeb3Active()) {
      try {
        await Moralis.User.logOut();
        dispatch(
          connectSuccess({
            address: "",
            identiconUrl: ""
          })
        );
      } catch (err) {
        console.log(err);
        dispatch(connectFailed("Logout Failed."));
      }
    }
  };
};

export const fetchCachedAccount = () => {
  return async (dispatch) => {
    if (isWeb3Active()) {
      const userAccount = await Moralis.User.current();
      if (userAccount != null) {
        console.table("1 account: ", userAccount);
        const address = userAccount.get("ethAddress");
        if (address != null && address !== "") {
          console.log("Init Account Address: " + address);
          dispatch(connectGameAndListener(address, false, false, ""));
        }
      }
    }
  };
};