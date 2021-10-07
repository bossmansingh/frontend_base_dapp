import { DialogType } from "./dataActions";

const initialState = {
  loading: false,
  address: "",
  errorMsg: "",
  dialogType: 'none',
  gameModel: null,
  baseGameFee: '0.05',
};

const dataReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'CHECK_DATA_REQUEST':
      return {
        ...initialState,
        loading: true,
      };
    case 'CHECK_DATA_SUCCESS':
      return {
        ...state,
        loading: false,
        showAccountChangeAlert: false,
        accountBalance: action.payload.address,
      };
    case 'CHECK_DATA_FAILED':
      return {
        ...state,
        loading: false,
        errorMsg: action.payload,
      };
    case 'SHOW_INFO_DIALOG':
      return {
        ...state,
        dialogType: DialogType.INFO
      };
    case 'SHOW_JOIN_GAME_DIALOG':
      return {
        ...state,
        dialogType: DialogType.JOIN_GAME
      };
    case 'SHOW_CREATE_GAME_DIALOG':
      return {
        ...state,
        dialogType: DialogType.CREATE_GAME
      };
    case 'HIDE_DIALOG':
      return {
        ...state,
        dialogType: DialogType.NONE
      };
    case 'CREATE_GAME':
      return {
        ...state,
        dialogType: DialogType.NONE,
        gameModel: action.payload.gameModel
      };
    case 'JOIN_GAME':
      return {
        ...state,
        dialogType: DialogType.NONE,
        gameModel: action.payload.gameModel
      };
    case 'UPDATE_GAME':
      return {
        ...state,
        dialogType: DialogType.NONE,
        gameModel: action.payload.gameModel
      };
    case 'UPDATE_MOVE':
      // const updatedModel = state.gameModel;
      // updatedModel.updateMove(action.payload.move);
      return {
        // ...state.gameModel.updateMove(action.payload.move)
      };
    case 'CLEAR_GAME_DATA':
      return {
        ...initialState
      };
    default:
      return state;
  }
};

export default dataReducer;