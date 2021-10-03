const Moralis = require('moralis');

const initialState = {
  loading: false,
  address: "",
  error: false,
  errorMsg: "",
  showInfoDialog: false,
  showJoinGameDialog: false,
  gameModel: null
};

export class GameModel extends Moralis.Object {
  constructor(gameId, playerAddress) {
    // Set class name
    super("GameModel");
    this.gameId = gameId;
    this.playerAddress = playerAddress;
    this.opponentAddress = "";
    this.winnerAddress = "";
    this.gameStarted = false;
    this.gameEnded = false;
    this.moves = "";
    this.gameCreateTime = 0;
    this.lastTurnTime = 0;
    this.currentTurnAddress = "";
    console.log("GameModel created");
  }

  startGame(address) {
    console.log("Start game");
    this.opponentAddress = address;
    this.gameStarted = true;
  }
  
  endGame(address) {
    console.log("End game");
    this.gameEnded = true;
    this.winnerAddress = address;
  }
  
  updateMove(move, address) {
    console.log("Update game");
    this.moves = move;
    this.currentTurnAddress = address;
  }
}
Moralis.Object.registerSubclass("GameModel", GameModel);

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
        gameModel: action.payload.gameModel
      };
    case "JOIN_GAME":
      const updatedModel = state.gameModel;
      updatedModel.startGame(action.payload.challengAcceptor);
      return {
        ...state,
        showInfoDialog: false,
        showJoinGameDialog: false,
        gameModel: updatedModel
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