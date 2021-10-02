const initialState = {
  loading: false,
  address: null,
  identiconUrl: null,
  gameContract: null,
  web3: null,
  errorMsg: ""
};

const blockchainReducer = (state = initialState, action) => {
  switch (action.type) {
    case "CONNECTION_REQUEST":
      return {
        ...initialState,
        loading: true,
      };
    case "CONNECTION_SUCCESS":
      return {
        ...state,
        loading: false,
        address: action.payload.address,
        identiconUrl: action.payload.identiconUrl,
        gameContract: action.payload.gameContract,
        web3: action.payload.web3,
      };
    case "CONNECTION_FAILED":
      return {
        ...state,
        loading: false,
        errorMsg: action.payload,
      };
    default:
      return state;
  }
};

export default blockchainReducer;
