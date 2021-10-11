import { getDarkSquareColor, getLightSquareColor } from "../../utils/Helpers";
import { DialogType } from "./dataActions";

const initialState = {
  loading: false,
  address: '',
  errorMessage: '',
  dialogType: 'none',
  gameModel: null,
  baseGameFee: '0.05',
  missedTurnCount: 0,
  lightSquareColor: getLightSquareColor(),
  darkSquareColor: getDarkSquareColor()
};

const dataReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'CHECK_DATA_REQUEST':
      console.log('Data request');
      return {
        ...initialState,
        loading: true
      };
    case 'CHECK_DATA_SUCCESS':
      console.log('Data success');
      return {
        ...state,
        loading: false,
        errorMessage: '',
        showAccountChangeAlert: false,
        accountBalance: action.payload.address
      };
    case 'CHECK_DATA_FAILED':
      console.log('Data failed');
      return {
        ...state,
        loading: false,
        errorMessage: action.payload
      };
    case 'SHOW_INFO_DIALOG':
      console.log('Show info dialog');
      return {
        ...state,
        errorMessage: '',
        dialogType: DialogType.INFO
      };
    case 'SHOW_JOIN_GAME_DIALOG':
      console.log('Show join game dialog');
      return {
        ...state,
        errorMessage: '',
        dialogType: DialogType.JOIN_GAME
      };
    case 'SHOW_CREATE_GAME_DIALOG':
      console.log('Show create game dialog');
      return {
        ...state,
        errorMessage: '',
        dialogType: DialogType.CREATE_GAME
      };
    case 'HIDE_DIALOG':
      console.log('Hide dialog');
      return {
        ...state,
        errorMessage: '',
        dialogType: DialogType.NONE
      };
    case 'CREATE_GAME':
      console.log('Create game');
      return {
        ...state,
        errorMessage: '',
        dialogType: DialogType.NONE,
        gameModel: action.payload.gameModel,
        missedTurnCount: 0
      };
    case 'JOIN_GAME':
      console.log('Join game');
      return {
        ...state,
        errorMessage: '',
        dialogType: DialogType.NONE,
        gameModel: action.payload.gameModel,
        missedTurnCount: 0
      };
    case 'UPDATE_GAME':
      console.log('Update game');
      const payloadMissedCount = action.payload.missedTurnCount;
      const newMissedCount = payloadMissedCount ? payloadMissedCount : state.missedTurnCount;
      const gameModel = action.payload.gameModel;
      return {
        ...state,
        errorMessage: '',
        dialogType: DialogType.NONE,
        missedTurnCount: newMissedCount,
        gameModel: gameModel ? gameModel : state.gameModel
      };
    case 'END_GAME':
      console.log('End game');
      return {
        ...state,
        dialogType: DialogType.ENG_GAME
      };
    case 'UPDATE_MOVE':
      console.log('Update move');
      // const updatedModel = state.gameModel;
      // updatedModel.updateMove(action.payload.move);
      return {
        // ...state.gameModel.updateMove(action.payload.move)
      };
    case 'UPDATE_BASE_GAME_FEE':
      console.log('Update base game fee');
      return {
        ...state,
        errorMessage: '',
        baseGameFee: action.payload
      };
    case 'CLEAR_GAME_DATA':
      console.log('Clear game data');
      return {
        ...initialState,
        lightSquareColor: getLightSquareColor(),
        darkSquareColor: getDarkSquareColor()
      };
    default:
      return state;
  }
};

export default dataReducer;