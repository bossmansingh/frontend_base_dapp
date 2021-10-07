// constants
import GameContract from "../../contracts/GameContract.json";
import blockies from "../../utils/Blockies";
import { isValidString } from "../../utils/Helpers";
import { showCreateGameDialog, joinGame, clearGameData, fetchDataFailed } from "../data/dataActions";

const Moralis = require('moralis');
const signingMessage = "Welcome to CHKMATE!\n Please sign this transaction to connect your wallet.\n\nBy signing you agree to terms and condition of CHKMATE.";

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

const clearBlockchainData = () => {
  return {
    type: "CLEAR_BLOCKCHAIN_DATA"
  };
};

async function isMetaMaskInstalled() {
  return await Moralis.isMetaMaskInstalled;
}

function addEventListener(dispatch) {
  // Add listeners start
  Moralis.onAccountsChanged(async (accounts) => {
    const newAddress = accounts[0];
    console.log("NewAddress: " + newAddress);
    try {
      await Moralis.link(newAddress);
    } catch (err) {
      console.log(err);
    }
    dispatch(
      connectSuccess({
        address: newAddress,
        identiconUrl: getIdenticonUrl(newAddress),
      })
    );
  });
  Moralis.onChainChanged(() => {
    console.log("Chain changed");
    window.location.reload();
  });
}

const getIdenticonUrl = (address) => {
  return blockies.create({
    seed: address,
    size: 8,
    scale: 5
  }).toDataURL();
};

const connectGameAndListener = (payload) => {
  return async (dispatch) => {
    const address = payload.address;
    const createGameRequest = payload.createGameRequest;
    const joinGameRequest = payload.joinGameRequest;
    const gameId = payload.gameId;
    const identiconUrl = getIdenticonUrl(address);
    // Init Contract
    const web3 = await Moralis.Web3.enable();

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
      console.log(`createGameRequest: ${createGameRequest}`);
      if (createGameRequest) {
        dispatch(showCreateGameDialog());
      } else if (joinGameRequest && isValidString(gameId)) {
        dispatch(joinGame({address: address, gameId: gameId}));
      }
    } else {
      dispatch(fetchDataFailed("Change network to CHKMATE."));
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

export const connectWallet = (payload) => {
  return async (dispatch) => {
    if (isMetaMaskInstalled()) {
      try {
        const createGameRequest = payload.createGameRequest;
        const joinGameRequest = payload.joinGameRequest;
        const gameId = payload.gameId;
        const gameFee = payload.gameFee;
        const lightSquareColor = payload.lightSquareColor;
        const darkSquareColor = payload.darkSquareColor;
        dispatch(connectRequest());
        const userAccount = await Moralis.Web3.authenticate({signingMessage: signingMessage});
        if (userAccount != null) {
          const address = userAccount.get("ethAddress");
          addEventListener(dispatch);
          dispatch(connectGameAndListener({
            createGameRequest: createGameRequest,
            joinGameRequest: joinGameRequest,
            gameId: gameId,
            gameFee: gameFee,
            address: address,
            lightSquareColor: lightSquareColor,
            darkSquareColor: darkSquareColor
          }));
        }
      } catch (err) {
        console.log(err);
        dispatch(fetchDataFailed("No web3 enabled wallet found. Please install one and then try again"));
      }
    } else {
      dispatch(fetchDataFailed("Please install a web3 enabled wallet"));
    }
  };
};

export const logout = () => {
  return async (dispatch) => {
    if (isMetaMaskInstalled()) {
      try {
        await Moralis.User.logOut();
        dispatch(clearGameData());
        dispatch(clearBlockchainData());
      } catch (err) {
        console.log(err);
        dispatch(fetchDataFailed("Logout Failed."));
      }
    }
  };
};

export const fetchCachedAccount = () => {
  return async (dispatch) => {
    if (isMetaMaskInstalled()) {
      const userAccount = await Moralis.User.current();
      if (userAccount != null) {
        const address = userAccount.get("ethAddress");
        if (address != null && address !== "") {
          addEventListener(dispatch);
          dispatch(connectGameAndListener({address: address}));
        }
      }
    }
  };
};