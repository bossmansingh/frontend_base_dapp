const initialState = {
  loading: false,
  address: "",
  error: false,
  errorMsg: "",
  showInfoDialog: false,
  showJoinGameDialog: false,
  gameCode: "",
  gameStarted: false,
  challenger: "",
  challengAcceptor: ""
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
        showAccountChangeAlert: false,
        accountBalance: action.payload.address,
      };
    case "CHECK_DATA_FAILED":
      return {
        ...state,
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
    case "CREATE_GAME":
      return {
        ...state,
        gameCode: action.payload.gameId,
        challenger: action.payload.challenger
      };
    case "JOIN_GAME":
      return {
        ...state,
        gameCode: action.payload.gameId,
        challenger: action.payload.challenger,
        challengAcceptor: action.payload.challengAcceptor
      };
    default:
      return state;
  }
};

export default dataReducer;