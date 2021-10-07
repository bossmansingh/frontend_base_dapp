const initialState = {
  address: null,
  identiconUrl: null,
  gameContract: null,
  web3: null
};

const blockchainReducer = (state = initialState, action) => {
  switch (action.type) {
    case "CONNECTION_SUCCESS":
      return {
        ...state,
        address: action.payload.address,
        identiconUrl: action.payload.identiconUrl,
        gameContract: action.payload.gameContract,
        web3: action.payload.web3,
      };
    case "CLEAR_BLOCKCHAIN_DATA":
      return {
        ...initialState
      };
    default:
      return state;
  }
};

export default blockchainReducer;
