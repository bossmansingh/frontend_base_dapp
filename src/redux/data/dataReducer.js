const initialState = {
  loading: false,
  address: "",
  error: false,
  errorMsg: "",
  showInfoDialog: false,
  showJoinGameDialog: false,
  gameModel: null
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
        ...state,
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
        ...state,
        showInfoDialog: action.payload
      };
    case "TOGGLE_JOIN_GAME_DIALOG":
      return {
        ...state,
        showJoinGameDialog: action.payload
      };
    case "CREATE_GAME":
      return {
        ...state,
        showInfoDialog: false,
        showJoinGameDialog: false,
        gameModel: action.payload.gameModel
      };
    case "JOIN_GAME":
      return {
        ...state,
        showInfoDialog: false,
        showJoinGameDialog: false,
        gameModel: action.payload.gameModel
      };
    case "UPDATE_GAME":
      // const updatedModel = state.gameModel;
      // updatedModel.updateMove(action.payload.move);
      return {
        ...state,
        showInfoDialog: false,
        showJoinGameDialog: false,
        gameModel: action.payload.gameModel
      };
    case "UPDATE_MOVE":
      // const updatedModel = state.gameModel;
      // updatedModel.updateMove(action.payload.move);
      return {
        ...state.gameModel.updateMove(action.payload.move)
      };
    case "LOGOUT":
      return {
        ...initialState
      };
    default:
      return state;
  }
};

export default dataReducer;