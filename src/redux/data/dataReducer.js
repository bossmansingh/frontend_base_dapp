const initialState = {
  loading: false,
  address: "",
  error: false,
  errorMsg: "",
  showInfoDialog: false,
  showJoinGameDialog: false,
  gameCode: ""
};

const dataReducer = (state = initialState, action) => {
  switch (action.type) {
    case "CHECK_DATA_REQUEST":
      return {
        ...initialState,
        loading: true,
      };
    case "CHECK_DATA_SUCCESS":
      return {
        ...initialState,
        loading: false,
        accountBalance: action.payload.address,
      };
    case "CHECK_DATA_FAILED":
      return {
        ...initialState,
        loading: false,
        error: true,
        errorMsg: action.payload,
      };
    case "TOGGLE_INFO_DIALOG":
      return {
        ...initialState,
        showInfoDialog: action.payload
      };
    case "TOGGLE_JOIN_GAME_DIALOG":
      return {
        ...initialState,
        showJoinGameDialog: action.payload
      };
    case "SET_GAME_CODE":
      return {
        ...initialState,
        gameCode: action.payload
      };
    default:
      return state;
  }
};

export default dataReducer;
