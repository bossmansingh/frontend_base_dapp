import React, { useEffect, useState, useRef } from "react";
import { connect, useDispatch, useSelector } from "react-redux";

import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";

import Chessboard from "chessboardjsx";
import Chess from "chess.js";

import { isValidString } from "./utils/Helpers";
import { connectWallet, fetchCachedAccount, logout } from "./redux/blockchain/blockchainActions";
import { DialogType, fetchData, createGame, joinGame, showInfoDialog, showCreateGameDialog, showJoinGameDialog, hideDialog, togglePlayerState } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import "./styles/clockStyle.css";

// import styled from "styled-components";
// import { create } from "ipfs-http-client";
import logo from "./assets/chessboard_logo.jpg";

const gameTitle = "Welcome to CHKMATE!";
const gameDescription = `First ever chess game built on blockchain. Create a new game or join an existing game using a game code. To read more about the rules of the game press the help icon in the top left corner.`;
const gameInstructions = "It is a NFT based game of chess where every player have a chance to mint a unique CHKMATE NFT win card, in half the price. Rules are simple here, to create a new game or to join an existing game it would cost you 0.05 eth. Each player has to deposits the same amount into the contract and the winner receives the CHKMATE NFT. Each card has unique characteristics about the game which includes winning piece, winning board, winning time and total kills.";
const rule1 = "1. To create a new game a fee of 0.05 eth is to be deposited into the contract."; 
const rule2 = "2. Once a game is created a unique code will be generated that you can share with the other player for them to join. The other player will have 30 minutes to join before the game auto-forfeits. In that case, the deposited eth will be returned to your wallet[1].";
const rule3 = "3. Once a game is started each player will have a two minute window to make a move. If no move is made within the given timeframe the turn will skip to the next player.";
const rule4 = "4. If any player for any reason disconnects from the game, it will be considered as a forfeit and the other player will win CHKMATE NFT card[2].";
const rule5 = "5. A game finishes when one of the player plays a check-mate move. The piece that makes the final move will be considered as the winning piece.";

// The random color should be generated when the game starts, before 
// that some default color should be used
let lightSquareColor = getLightSquareColor();
let darkSquareColor = getDarkSquareColor();
const youTitle = "YOU";
const opponentTitle = "OPPONENT";

// Function to generate and return light square color
function getLightSquareColor() {
  const min = 160;
  const max = 255;
  const r = getRandomNumber(min, max);
  const g = getRandomNumber(min, max);
  const b = getRandomNumber(min, max);
  return `${r},${g},${b}`;
}

// Function to generate and return dark square color
function getDarkSquareColor() {
  const min = 50;
  const max = 140;
  const r = getRandomNumber(min, max);
  const g = getRandomNumber(min, max);
  const b = getRandomNumber(min, max);
  return `${r},${g},${b}`;
}

// Function to generate random number 
function getRandomNumber(min, max) { 
  return Math.floor(Math.random() * (max - min) + min);
}

function stringValueEqual(str1, str2) {
  if (!isValidString(str1) || !isValidString(str2)) {
    return false;
  } else {
    const result = str1.localeCompare(str2, undefined, { sensitivity: 'base' }) === 0;
    return result;
  }
}

function App() {

  const gameBoard = useRef(null);
  const [gameCode, _setGameCode] = useState('');
  const [gameFee, _setGameFee] = useState('0.05');

  const gameCodeInputEvent = (event) => {
    _setGameCode(event.target.value);
  };
  
  const gameFeeInputEvent = (event) => {
    event.preventDefault();
    const newGameFeeValue = event.target.value;
    const isNewFeeLowerThanBase = newGameFeeValue < baseGameFee;
    const newGameFee = isNewFeeLowerThanBase ? baseGameFee : newGameFeeValue;
    if (newGameFee !== gameFee) {
      console.log('Update Game Fee');
      _setGameFee(newGameFee);
    }
  };
  
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const address = blockchain.address;
  const contract = blockchain.gameContract;
  const walletConnected = isValidString(address);
  const contractFetched = contract != null;
  const gameConnected = walletConnected && contractFetched;
  const dialogType = data.dialogType;
  const gameModel = data.gameModel;
  const createGameDialog = stringValueEqual(dialogType, DialogType.CREATE_GAME);
  const joinGameDialog = stringValueEqual(dialogType, DialogType.JOIN_GAME);
  const infoDialog = stringValueEqual(dialogType, DialogType.INFO);
  let baseGameFee = data.baseGameFee;
  let gameCreated = gameModel != null;
  let gameStarted = false;
  let playerAddress = '';
  let opponentAddress = '';
  let currentTurnAddress = '';
  let fenString = 'start';
  if (gameCreated) {
    fenString = gameModel.get('fenString');
    gameStarted = gameModel.get('gameStarted');
    playerAddress = gameModel.get('playerAddress');
    opponentAddress = gameModel.get('opponentAddress');
    currentTurnAddress = gameModel.get('currentTurnAddress');
    lightSquareColor = gameModel.get('lightSquareColor');
    darkSquareColor = gameModel.get('darkSquareColor');
    baseGameFee = gameModel.get('gameFee');
  }
  const isPlayer = stringValueEqual(playerAddress, address);
  const isOpponent = stringValueEqual(opponentAddress, address);

  const playerTurn = stringValueEqual(currentTurnAddress, playerAddress);
  const opponentTurn = stringValueEqual(currentTurnAddress, opponentAddress);
  
  console.log("App() | player: " + playerTurn);
  console.log("App() | opponent: " + opponentTurn);
  console.log("App() | Address: " + address);
  console.log("App() | walletConnected: " + walletConnected);
  console.log("App() | contractFetched: " + contractFetched);
  console.log("App() | gameConnected: " + gameConnected);
  console.log("App() | gameCreated: " + gameCreated);
  console.log("App() | gameStarted: " + gameStarted);
  console.log("App() | playerAddress: " + playerAddress);
  console.log("App() | opponentAddress: " + opponentAddress);
  console.log("App() | currentTurnAddress: " + currentTurnAddress);
  console.log("App() | fenString: " + fenString);
  console.log("App() | dialogType: " + dialogType);
  console.log("App() | showCreateGameDialog: " + createGameDialog);
  console.log("App() | showJoinGameDialog: " + joinGameDialog);
  console.log("App() | showInfoDialog: " + infoDialog);
  

  useEffect(() => {
    if (gameConnected) {
      // TODO: fetch NFT data
      dispatch(fetchData(address));
      // Init chess board
      gameBoard.current = new Chess();
      //updateStatus();
    }
  }, [address, gameConnected, dispatch]);

  // Init account from cache
  if (!walletConnected) {
    dispatch(fetchCachedAccount());
  }
  return (
    <s.ResponsiveWrapper>
      {renderToolbar()}
      {renderHelpPopup()}
      {renderCreateGamePopup()}
      {renderJoinGamePopup()}
      {gameCreated ? renderGameBoard() : renderWelcomePage()}
      {/* 
        If account connected or not-connected and no NFTs minted show the chessboard with start game button
        If account connected or not-connected and NFTs minted show minted NFTs with start game button
        TODO: Show minted NFTs (in carousel) 
      */}
    </s.ResponsiveWrapper>
  );

  function renderToolbar() {
    return <s.Container
      ai={'center'}
      fd={'row'}
      style={{padding: '8px'}}
    >
      <s.HelpButton id='help_button'
        style={{width:'40px', height:'40px', marginLeft: '5px'}}
        onClick={(e) => {
          e.preventDefault();
          dispatch(showInfoDialog());
        } 
      }>?</s.HelpButton>
      <s.TextPageTitle
        style={{ 
          color: 'white', 
          marginLeft: 'auto', 
          paddingLeft: (walletConnected ? '0px' : '60px') 
        }}
      >
        CHKMATE
      </s.TextPageTitle>
      <s.Container 
        style={{ 
          marginLeft: 'auto',
          marginRight: '5px'
        }}
      >
        { walletConnected && blockchain.identiconUrl != null ? (
          <s.Identicon 
            alt='user_identicon' 
            src={(blockchain.identiconUrl != null ? blockchain.identiconUrl : logo)}
            onClick={(e) => {
              e.preventDefault();
              dispatch(logout());
            }} />
        ) : (
          <s.StyledButton
            onClick={(e) => {
              e.preventDefault();
              dispatch(connectWallet({
                lightSquareColor: lightSquareColor, 
                darkSquareColor: darkSquareColor
              }));
            } 
          }>
            CONNECT
          </s.StyledButton>
        )}
      </s.Container>
    </s.Container>;
  }

  function renderWelcomePage() {
    return (
      <s.Container key='welcome_page_container' ai={'center'} jc={'center'} fd={'row'} style={{padding: '50px'}}>
        {setChessboard(false)}
        <s.SpacerXXLarge />
        <s.Container ai={'center'} jc={'center'} style={{padding: '20px'}}>
          <s.TextSubTitle style={{textAlign: 'center'}}>{gameTitle}</s.TextSubTitle>
          <s.SpacerSmall />
          <s.TextDescription style={{
            textAlign: 'justify',
            marginLeft: '5px',
            marginRight: '5px'
          }}>{gameDescription}</s.TextDescription>
          <s.SpacerMedium />
          {blockchain.errorMsg !== "" ? (
            <s.TextParagraph style={{textAlign:'center', color: 'red'}}>{blockchain.errorMsg}</s.TextParagraph>
          ) : null}
          <s.SpacerMedium />
          <s.Container ai={'center'} jc={'center'} fd={'row'}>
            <s.StyledButton style={{width:'130px', height:'40px'}}
              onClick={(e) => {
                e.preventDefault();
                if (gameConnected) {
                  dispatch(showCreateGameDialog());
                } else {
                  dispatch(connectWallet({
                    createGameRequest: true, 
                    lightSquareColor: lightSquareColor, 
                    darkSquareColor: darkSquareColor
                  }));
                }
              }}>Create Game</s.StyledButton>
            <s.SpacerMedium />
            <s.StyledButton style={{width:'130px', height:'40px'}}
              onClick={(e) => {
                dispatch(showJoinGameDialog());
                e.preventDefault();
              }}
            >
              Join Game
            </s.StyledButton>
          </s.Container>
        </s.Container>
      </s.Container>
    );
  }

  function onDragStart (payload) {
    console.log('onDragStart');
    const piece = payload.piece;
    // do not pick up pieces if the game is over
    if (gameBoard.current.game_over()) return false;
    console.log('Game not over');
    console.log('Current turn ' + gameBoard.current.turn());
    // only pick up pieces for the side to move
    if ((gameBoard.current.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (gameBoard.current.turn() === 'b' && piece.search(/^w/) !== -1)) {
      return false;
    }
  }
  
  function onDrop(payload) {
    const source = payload.sourceSquare;
    const target = payload.targetSquare;
    
    // see if the move is legal
    const move = gameBoard.current.move({
      from: source,
      to: target
    });
    
    // illegal move
    if (move === null) return 'snapback';
  
    updateStatus();
  }
  
  // update the board position after the piece snap
  // for castling, en passant, pawn promotion
  // function onSnapEnd() {
  //   board.position(gameBoard.fen());
  // }
  
  function updateStatus () {
    let status = "";
  
    const moveColor = gameBoard.current.turn() === 'b' ? 'Black' : 'White';
    const address = gameBoard.current.turn() === 'w' ? playerAddress : opponentAddress;
  
    // checkmate?
    if (gameBoard.current.in_checkmate()) {
      status = 'Game over, ' + moveColor + ' is in checkmate.';
    }
  
    // draw?
    else if (gameBoard.current.in_draw()) {
      status = 'Game over, drawn position';
    }
  
    // game still on
    else {
      status = moveColor + ' to move';
  
      // check?
      if (gameBoard.current.in_check()) {
        status += ', ' + moveColor + ' is in check';
      }
    }
  
    console.log('Game Status: ' + status);
    console.log('Game Fen: ' + gameBoard.current.fen());
    if (gameModel != null) {
      dispatch(togglePlayerState({gameModel: gameModel, address: address, fen: gameBoard.current.fen()}))
    }
    //   $status.html(status);
    //   $fen.html(game.fen());
    //   $pgn.html(game.pgn());
  }

  function setChessboard(isEnable) {
    return(
      <Chessboard
        position={fenString}
        draggable={isEnable}
        lightSquareStyle={{ backgroundColor: `rgb(${lightSquareColor})` }}
        darkSquareStyle={{ backgroundColor: `rgb(${darkSquareColor})` }}
        showNotation={false}
        onDragStart={onDragStart}
        onDrop={onDrop}
        // pieces={{
        //   wK: () => (
        //     <img
        //       style={{
        //         alignItems: "center",
        //         justifyContent: "center",
        //         flexDirection: "center",
        //         borderRadius: "35px",
        //         width: "70px",
        //         height: "70px"
        //       }}
        //       src={blockchain.identiconUrl}
        //       alt={"player1"}
        //     />
        //   )
        // }} 
        />
    );
  }

  function renderHelpPopup() {
    return(
      <Dialog open={infoDialog} onClose={hideDialog}>  
        <DialogContent>
          <s.Container 
            ai={'center'} 
            style={{
              paddingBottom: '20px'
            }}>
            <s.TextTitle 
              style={{
                color: 'black', 
                textAlign: 'center'
              }}
            >
              Welcome to the world of CHKMATE!
            </s.TextTitle>
            <s.SpacerXSmall/>
            <s.TextParagraph 
              style={{
                color: 'black'
              }}
            >
              {gameInstructions}
            </s.TextParagraph>
            <s.SpacerMedium/>
            <s.Container>
              <s.TextSubTitle 
                style={{
                  color: 'black'
                }}
              >
                Game rules:
              </s.TextSubTitle>
              <s.TextParagraph 
                style={{
                  padding: '12px', 
                  color: 'black'
                }}
              >
                {rule1}
              </s.TextParagraph>
              <s.TextParagraph 
                style={{
                  padding: '12px', 
                  color: 'black'
                }}
                >
                  {rule2}
                </s.TextParagraph>
              <s.TextParagraph 
                style={{
                  padding: '12px', 
                  color: 'black'
                }}
              >
                {rule3}
              </s.TextParagraph>
              <s.TextParagraph 
                style={{
                  padding: '12px',
                  color: 'black'
                }}
              >
                {rule4}
              </s.TextParagraph>
              <s.TextParagraph 
                style={{
                  padding: '12px', 
                  color: 'black'
                }}
              >
                {rule5}
              </s.TextParagraph>
              <s.SpacerSmall />
              <s.TextParagraph 
                style={{
                  color:'black',
                  paddingLeft:'12px',
                  fontSize: '14px'
                }}
              >
                [1]Minus the gas fees
              </s.TextParagraph>
              <s.TextParagraph 
                style={{
                  color:'black',
                  paddingLeft:'12px',
                  fontSize: '14px'
                }}
              >
                [2]The winning NFT card will not include a winning piece
              </s.TextParagraph>
            </s.Container>
            <s.SpacerMedium/>
            <s.StyledButton 
              bc={'black'}
              color={'white'}
              style={{
                fontSize: '20px'
              }} 
              onClick={(e)=> {
                e.preventDefault();
                dispatch(hideDialog());
              }}
            >
              Close
            </s.StyledButton>
          </s.Container>
        </DialogContent>
      </Dialog>
    );
  }

  function renderCreateGamePopup() {
    return(
      <Dialog
        open={createGameDialog}
        onClose={(e) => {
          e.preventDefault();
          dispatch(hideDialog());
        }}
      >
        <DialogContent>
            <s.Container 
              ai={"center"} 
              jc={"center"}
              style={{
                paddingBottom: '20px',
                paddingLeft: '10px',
                paddingRight: '10px'
              }}
            >
              <s.TextTitle 
                style={{
                  color: 'black', 
                  textAlign: 'center'
                }}
              >
                CREATE NEW GAME
              </s.TextTitle>
              <s.TextDescription
                style={{color: 'black', textAlign: 'center'}}
              >
                Set a base game fee that will be paid by both participants. A minimum fee of 0.05 eth is required
              </s.TextDescription>
              <s.SpacerMedium />
              <s.InputContainer 
                style={{textAlign: 'center'}}
                value={gameFee}
                onChange={(e) => {
                  e.preventDefault();
                  gameFeeInputEvent(e);
                }} />
              {
                data.errorMsg ? 
                (
                  <s.TextParagraph
                    style={{color: 'red', paddingTop: '10px', textAlign: 'center'}}
                  >
                    {data.errorMsg}
                  </s.TextParagraph>
                ) : (
                  null
                )
              }
              <s.SpacerLarge />
              <s.Container 
                fd={"row"}
                jc={"center"}>
                <s.StyledButton 
                  flex={1}
                  bc={'black'}
                  color={'white'}
                  style={{
                    fontSize: '20px',
                    width: '200px'
                  }} 
                  onClick={(e) => {
                    e.preventDefault();
                    if (gameConnected) {
                      dispatch(createGame({
                        gameFee: gameFee,
                        address: address, 
                        lightSquareColor: lightSquareColor, 
                        darkSquareColor: darkSquareColor
                      }));
                    } else {
                      dispatch(connectWallet({
                        joinGameRequest: true,
                        gameFee: gameFee,
                        gameId: gameCode, 
                        lightSquareColor: lightSquareColor, 
                        darkSquareColor: darkSquareColor
                      }));
                    }
                  }}
                >
                  Create Game
                </s.StyledButton>
                <s.SpacerSmall />
                <s.StyledButton 
                  flex={1}
                  style={{
                    fontSize: '20px',
                    width: '200px'
                  }} onClick={(e) => {
                    e.preventDefault();
                    dispatch(hideDialog());
                  }}
                >
                  Cancel
                </s.StyledButton>
              </s.Container>
            </s.Container>
          </DialogContent>
      </Dialog>
    )
  }
  
  function renderJoinGamePopup() {
    return(
      <Dialog 
        open={joinGameDialog} 
        onClose={(e) => {
          e.preventDefault();
          dispatch(hideDialog());
        }}
      >
        <DialogContent>
          <s.Container 
            ai={"center"} 
            jc={"center"}
            style={{
              paddingBottom: '20px',
              paddingLeft: '10px',
              paddingRight: '10px'
            }}
          >
            <s.TextTitle 
              style={{
                color: 'black', 
                textAlign: 'center'
              }}
            >
              ENTER GAME CODE
            </s.TextTitle>
            <s.SpacerSmall />
            <s.InputContainer 
              style={{textAlign: 'center'}}
              placeholder={'Game Code'} 
              onChange={(e) => {
                e.preventDefault();
                gameCodeInputEvent(e);
              }} />
            {
              data.errorMsg ? 
              (
                <s.TextParagraph
                  style={{color: 'red', paddingTop: '10px', textAlign: 'center'}}
                >
                  {data.errorMsg}
                </s.TextParagraph>
              ) : (
                null
              )
            }
            <s.SpacerLarge />
            <s.Container 
              fd={"row"}
              jc={"center"}>
              <s.StyledButton 
                flex={1}
                bc={'black'}
                color={'white'}
                style={{
                  fontSize: '20px',
                  width: '200px'
                }} 
                onClick={(e) => {
                  e.preventDefault();
                  if (gameConnected) {
                    dispatch(joinGame({gameId: gameCode, address: address}));
                  } else {
                    dispatch(connectWallet({
                      joinGameRequest: true,
                      gameId: gameCode, 
                      lightSquareColor: lightSquareColor, 
                      darkSquareColor: darkSquareColor
                    }));
                  }
                }}
              >
                Join Game
              </s.StyledButton>
              <s.SpacerSmall />
              <s.StyledButton 
                flex={1}
                style={{
                  fontSize: '20px',
                  width: '200px'
                }} onClick={(e) => {
                  e.preventDefault();
                  dispatch(hideDialog());
                }}
              >
                Cancel
              </s.StyledButton>
            </s.Container>
          </s.Container>
        </DialogContent>
      </Dialog>
    )
  }

  function renderGameBoard() {
    return(
      <s.Container
        fd={'row'}
        jc={"center"}
        ai={'center'}
        style={{padding: '50px'}}
      >
        {setChessboard(gameStarted && ((isPlayer && playerTurn) || (isOpponent && opponentTurn)))}
        <s.SpacerXXLarge/>
        <s.Container
          ai={'center'}
          jd={'center'}
          style={{opacity: gameStarted ? '1' : '0.25'}}
        >
          {addClock(playerTurn)}
          <s.SpacerMedium/>
          <s.TextSubTitle
            style={{
              textAlign: 'center', 
              fontFamily: 'default-font'
            }}
          >
            {isPlayer ? (youTitle) : (opponentTitle)}
          </s.TextSubTitle>
        </s.Container>
        <s.SpacerLarge/>
        <s.Container
          ai={"center"}
          jd={"center"}
          style={{opacity: gameStarted ? "1" : "0.25"}}
        >
          {addClock(opponentTurn)}
          <s.SpacerMedium/>
          <s.TextSubTitle
            style={{
              textAlign: "center", 
              fontFamily: "default-font"
            }}
          >
            {isOpponent ? (youTitle) : (opponentTitle)}
          </s.TextSubTitle>
        </s.Container>
      </s.Container>
    );
  }

  function addClock(isEnabled) {
    const clockIndicators = []
    for (let i = 0; i < 90; i++) {
      const key = `clock-indicator-${i}`;
      clockIndicators[i] = <s.ClockContainer key={key} className='clock-indicator'/>
    }
    return(
      <s.ClockContainer className='clock-wrapper'>
        <s.ClockContainer className='clock-base'>
          <s.ClockContainer className='clock-dial'>
            {clockIndicators}
          </s.ClockContainer>
          <s.ClockContainer className='clock-second' rotate={isEnabled ? 1 : 0} 
            onAnimationEnd={() => togglePlayer()} 
          />
          <s.ClockContainer className='clock-center'/>
        </s.ClockContainer>
      </s.ClockContainer>
    );
  }

  function togglePlayer() {
    // Toggle player turn state
    if (playerTurn && isValidString(opponentAddress) && gameModel != null) {
      dispatch(togglePlayerState({gameModel: gameModel, address: opponentAddress}))
    } else if (opponentTurn && isValidString(playerAddress) && gameModel != null) {
      dispatch(togglePlayerState({gameModel: gameModel, address: playerAddress}))
    }
  }
}

export default App;