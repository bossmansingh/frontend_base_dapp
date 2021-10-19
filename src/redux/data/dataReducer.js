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
  nftImage: null,
  lightSquareColor: getLightSquareColor(),
  darkSquareColor: getDarkSquareColor()
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
    case 'SHOW_NFT_CREATED_DIALOG':
      const image = action.payload ? action.payload.image : null;
      return {
        ...state,
        errorMessage: '',
        dialogType: DialogType.NFT_CREATED,
        nftImage: image
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
      const gameModel = action.payload.gameModel;
      return {
        ...state,
        errorMessage: '',
        dialogType: DialogType.NONE,
        missedTurnCount: newMissedCount,
        gameModel: gameModel ? gameModel : state.gameModel
      };
    case 'END_GAME':
      return {
        ...state,
        dialogType: DialogType.ENG_GAME
      };
    case 'UPDATE_BASE_GAME_FEE':
      return {
        ...state,
        errorMessage: '',
        baseGameFee: action.payload
      };
    case 'CLEAR_GAME_DATA':
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