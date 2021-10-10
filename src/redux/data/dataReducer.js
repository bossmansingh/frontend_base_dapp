import { DialogType } from "./dataActions";

const initialState = {
  loading: false,
  address: '',
  errorMessage: '',
  dialogType: 'none',
  gameModel: null,
  baseGameFee: '0.05',
  missedTurnCount: 0
};

const dataReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'CHECK_DATA_REQUEST':
      return {
        ...initialState,
        loading: true
      };
    case 'CHECK_DATA_SUCCESS':
      return {
        ...state,
        loading: false,
        errorMessage: '',
        showAccountChangeAlert: false,
        accountBalance: action.payload.address
      };
    case 'CHECK_DATA_FAILED':
      return {
        ...state,
        loading: false,
        errorMessage: action.payload
      };
    case 'SHOW_INFO_DIALOG':
      return {
        ...state,
        errorMessage: '',
        dialogType: DialogType.INFO
      };
    case 'SHOW_JOIN_GAME_DIALOG':
      return {
        ...state,
        errorMessage: '',
        dialogType: DialogType.JOIN_GAME
      };
    case 'SHOW_CREATE_GAME_DIALOG':
      return {
        ...state,
        errorMessage: '',
        dialogType: DialogType.CREATE_GAME
      };
    case 'HIDE_DIALOG':
      return {
        ...state,
        errorMessage: '',
        dialogType: DialogType.NONE
      };
    case 'CREATE_GAME':
      return {
        ...state,
        errorMessage: '',
        dialogType: DialogType.NONE,
        gameModel: action.payload.gameModel,
        missedTurnCount: 0
      };
    case 'JOIN_GAME':
      return {
        ...state,
        errorMessage: '',
        dialogType: DialogType.NONE,
        gameModel: action.payload.gameModel,
        missedTurnCount: 0
      };
    case 'UPDATE_GAME':
      const payloadMissedCount = action.payload.missedTurnCount;
      const newMissedCount = payloadMissedCount ? payloadMissedCount : state.missedTurnCount;
      return {
        ...state,
        errorMessage: '',
        dialogType: DialogType.NONE,
        missedTurnCount: newMissedCount,
        gameModel: action.payload.gameModel
      };
    case 'UPDATE_MOVE':
      // const updatedModel = state.gameModel;
      // updatedModel.updateMove(action.payload.move);
      return {
        // ...state.gameModel.updateMove(action.payload.move)
      };
    case 'UPDATE_BASE_GAME_FEE':
      return {
        ...state,
        errorMessage: '',
        baseGameFee: action.payload
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