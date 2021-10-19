import React, { useEffect, useState, createRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useScreenshot } from 'use-react-screenshot';

import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";

import Chessboard from "chessboardjsx";
import Chess from "chess.js";

import * as h from "./utils/Helpers";
import * as b from "./redux/blockchain/blockchainActions";
import * as d from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import "./styles/clockStyle.css";

// import styled from "styled-components";
// import { create } from "ipfs-http-client";
import logo from "./assets/images/chessboard_logo.jpg";
import copyIcon from "./assets/images/copy_to_clipboard.png";

const gameBoard = new Chess();
const defaultFenString = 'start';
const maxTurnTimeInSeconds = 20;
const maxMissedTurnCount = 2;
const gameTitle = 'Welcome to CHKMATE!';
const gameDescription = 'First ever chess game built on blockchain. Create a new game or join an existing game using a game code. To read more about the rules of the game press the help icon in the top left corner.';
const gameInstructions = 'It is a NFT based game of chess where every player have a chance to mint a unique CHKMATE NFT win card, in half the price. Rules are simple here, to create a new game or to join an existing game it would cost you 0.05 eth. Each player has to deposits the same amount into the contract and the winner receives the CHKMATE NFT. Each card has unique characteristics about the game which includes winning piece, winning board, winning time and total kills.';
const rule1 = '1. To create a new game a fee of 0.05 eth is to be deposited into the contract.'; 
const rule2 = '2. Once a game is created a unique code will be generated that you can share with the other player for them to join. The other player will have 30 minutes to join before the game auto-forfeits. In that case, the deposited eth will be returned to your wallet[1].';
const rule3 = '3. Once a game is started each player will have a two minute window to make a move. If no move is made within the given timeframe the turn will skip to the next player.';
const rule4 = '4. If any player for any reason disconnects from the game, it will be considered as a forfeit and the other player will win CHKMATE NFT card[2].';
const rule5 = '5. A game finishes when one of the player plays a check-mate move. The piece that makes the final move will be considered as the winning piece.';

// Constants
const youTitle = "YOU";
const opponentTitle = "OPPONENT";
const handleCopyClick = async (text) => {
  try {
    await copyTextToClipboard(text);
    alert('Copied to clipboard');
  } catch (err) {
    console.log(err);
  }
};

// This is the function we wrote earlier
async function copyTextToClipboard(text) {
  if ('clipboard' in navigator) {
    return await navigator.clipboard.writeText(text);
  } else {
    return document.execCommand('copy', true, text);
  }  
}

// Window lifecycle events
window.onload = async () => {
  console.log('onLoad');
  // console.log(`gameStarted: ${gameStarted}`);
  // console.log(`gameEnded: ${gameEnded}`);
  // console.log(`opponentAddress: ${opponentAddress}`);
  // console.log(`playerAddress: ${playerAddress}`);
  // if (gameStarted && !gameEnded && isValidString(opponentAddress) && isValidString(playerAddress)) {
  //   //const address = isPlayer ? opponentAddress : playerAddress;
  //   await endGameFun({gameShortId: gameShortId, address: address});
  //   //dispatch(endGame({gameShortId: gameShortId, address: address}));
    
  // }
};

// window.onbeforeunload = async () => {
//   console.log('onBeforeUnLoad');
//   // console.log(`gameStarted: ${gameStarted}`);
//   // console.log(`gameEnded: ${gameEnded}`);
//   // console.log(`opponentAddress: ${opponentAddress}`);
//   // console.log(`playerAddress: ${playerAddress}`);
//   // if (gameStarted && !gameEnded && isValidString(opponentAddress) && isValidString(playerAddress)) {
//   //   //const address = isPlayer ? opponentAddress : playerAddress;
//   //   await endGameFun({gameShortId: gameShortId, address: address});
//   //   //dispatch(endGame({gameShortId: gameShortId, address: address}));
//   //   return null;
//   // }
// };

window.onpageshow = async () => {
  console.log('onPageShow');
};

function App() {
  const chessboardRef = createRef(null);
  const [gameCode, _setGameCode] = useState('');
  const [gameFee, _setGameFee] = useState('0.05');
  const [image, takeScreenshot] = useScreenshot();

  const createNFTCard = ({winnerAddress, otherAddress}) => {
    try {
      takeScreenshot(chessboardRef.current);
      console.log(`image: ${image}`);
      dispatch(d.createNFTImage({
        winnerAddress: winnerAddress, 
        otherAddress: otherAddress, 
        chessboard: image
      }));
    } catch (ex) {
      console.log(ex);
    }
  };

  // window.onpagehide = async () => {
  //   console.log('onPageHide');
  //   // if (gameInProgress) {
  //   //   const address = isPlayer ? opponentAddress : playerAddress;
  //   //   return await d.endGameFun({gameShortId: gameShortId, winnerAddress: address});
  //   //   //dispatch(d.endGame({gameShortId: gameShortId, winnerAddress: address})); 
  //   // }
  //   return null;
  // };

  // window.onunload = async () => {
  //   console.log('onUnLoad');
  //   // console.log(`gameStarted: ${gameStarted}`);
  //   // console.log(`gameEnded: ${gameEnded}`);
  //   // console.log(`opponentAddress: ${opponentAddress}`);
  //   // console.log(`playerAddress: ${playerAddress}`);
  //   // if (gameStarted && !gameEnded && isValidString(opponentAddress) && isValidString(playerAddress)) {
  //   //   const address = isPlayer ? opponentAddress : playerAddress;
  //   //   await endGameFun({gameShortId: gameShortId, address: address});
  //   //   //dispatch(endGame({gameShortId: gameShortId, address: address}));
  //   // }
    
  // };

  const gameCodeInputEvent = (event) => {
    event.preventDefault();
    _setGameCode(event.target.value);
  };
  
  const gameFeeInputEvent = (event) => {
    event.preventDefault();
    const newGameFeeValue = event.target.value;
    const isNewFeeLowerThanBase = newGameFeeValue < baseGameFee;
    const newGameFee = isNewFeeLowerThanBase ? baseGameFee : newGameFeeValue;
    if (newGameFee !== gameFee) {
      _setGameFee(newGameFee);
    }
  };
  
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const loggedInAddress = blockchain.address;
  const contract = blockchain.gameContract;
  const walletConnected = h.isValidString(loggedInAddress);
  const contractFetched = contract != null;
  const gameConnected = walletConnected && contractFetched;
  const dialogType = data.dialogType;
  const gameModel = data.gameModel;
  const showCreateGameDialog = h.stringValueEqual(dialogType, d.DialogType.CREATE_GAME);
  const showJoinGameDialog = h.stringValueEqual(dialogType, d.DialogType.JOIN_GAME);
  const showEndGameDialog = h.stringValueEqual(dialogType, d.DialogType.ENG_GAME);
  const showInfoDialog = h.stringValueEqual(dialogType, d.DialogType.INFO);
  const showNFTDialog = h.stringValueEqual(dialogType, d.DialogType.NFT_CREATED);
  const missedTurnCount = data.missedTurnCount;
  let lightSquareColor = data.lightSquareColor;
  let darkSquareColor = data.darkSquareColor;

  let baseGameFee = data.baseGameFee;
  let gameExists = gameModel != null;
  let gameInProgress = false;
  let gameEnded = false;
  let playerAddress = null;
  let opponentAddress = null;
  let currentTurnAddress = null;
  let winnerAddress = null;
  let gameShortId = null;
  let fenString = defaultFenString;
  let updatedAt = new Date();
  
  if (gameExists) {
    gameShortId = h.getShortGameId(gameModel.id);
    playerAddress = gameModel.get(d.GameModelDataType.PLAYER_ADDR);
    opponentAddress = gameModel.get(d.GameModelDataType.OPPONENT_ADDR);
    winnerAddress = gameModel.get(d.GameModelDataType.WINNER_ADDR);
    fenString = gameModel.get(d.GameModelDataType.FEN_STRING);
    currentTurnAddress = gameModel.get(d.GameModelDataType.CURRENT_TURN_ADDR);
    lightSquareColor = gameModel.get(d.GameModelDataType.LIGHT_SQUARE_COLOR);
    darkSquareColor = gameModel.get(d.GameModelDataType.DARK_SQUARE_COLOR);
    baseGameFee = gameModel.get(d.GameModelDataType.GAME_FEE);
    updatedAt = gameModel.updatedAt;
    const gameStarted = h.isValidString(playerAddress) && h.isValidString(opponentAddress);
    gameEnded = gameModel.get(d.GameModelDataType.GAME_ENDED);
    gameInProgress = gameStarted && !gameEnded;
  }
  // Init chess board
  gameBoard.load(fenString);
  
  const isCurrentTurn = h.stringValueEqual(currentTurnAddress, loggedInAddress);
  const isPlayer = h.stringValueEqual(playerAddress, loggedInAddress);
  const isPlayerTurn = h.stringValueEqual(currentTurnAddress, playerAddress);
  const isOpponent = h.stringValueEqual(opponentAddress, loggedInAddress);
  const isOpponentTurn = h.stringValueEqual(currentTurnAddress, opponentAddress);
  
  
  console.log("App() | player: " + isPlayerTurn);
  console.log("App() | opponent: " + isOpponentTurn);
  console.log("App() | LoggedInAddress: " + loggedInAddress);
  console.log("App() | walletConnected: " + walletConnected);
  console.log("App() | contractFetched: " + contractFetched);
  console.log("App() | gameConnected: " + gameConnected);
  console.log("App() | dialogType: " + dialogType);
  console.log("App() | showCreateGameDialog: " + showCreateGameDialog);
  console.log("App() | showJoinGameDialog: " + showJoinGameDialog);
  console.log("App() | showInfoDialog: " + showInfoDialog);
  console.log("App() | baseGameFee: " + baseGameFee);
  console.log("App() | endGameDialog: " + showEndGameDialog);
  console.log("App() | missedTurnCount: " + missedTurnCount);

  useEffect(() => {
    console.log("................Use effect................");
    // Init account from cache
    if (gameConnected) {
      // TODO: fetch NFT data
      dispatch(d.fetchData(loggedInAddress));
    }
    if (!walletConnected) {
      dispatch(b.fetchCachedAccount());
    }
  }, [loggedInAddress, walletConnected, gameConnected, dispatch]);

  function getLatestStatus() {
    if (showEndGameDialog) return 'Auto-Forfeit';

    let status = "";
    const moveColor = gameBoard.turn() === 'b' ? 'Black' : 'White';
    // checkmate?
    if (gameBoard.in_checkmate()) {
      status = 'Game over, ' + moveColor + ' is in checkmate.';
      dispatch(d.endGame({gameShortId: gameShortId, address: currentTurnAddress}));
    }
  
    // draw?
    else if (gameBoard.in_draw()) {
      status = 'Game over, drawn position';
    }
  
    // game still on
    else {
      status = moveColor + ' to move';
  
      // check?
      if (gameBoard.in_check()) {
        status += ', ' + moveColor + ' is in check';
      }
    }
    //console.log('Game Status: ' + status);
    return status;
  }

  function getForfeitDialogTitle() {
    return `The game was auto-forfeit because ${h.stringValueEqual(winnerAddress, loggedInAddress) ? 'other player' : 'you'} left the game. No one won, sorry :(`;
  }

  function reachedMaxMissedTurns() {
    const result = missedTurnCount >= maxMissedTurnCount;
    console.log(`Result: ${result}`);
    return result;
  }

  // Chess game methods and constants
  const allowDrag = ({piece, sourceSquare}) => {
    if (gameBoard == null) return false;

    if (!isCurrentTurn) return false;
    
    // do not pick up pieces if the game is over
    if (gameBoard.game_over()) return false;
    // only pick up pieces for the side to move
    if ((isPlayerTurn && piece.search(/^b/) !== -1) || (isOpponentTurn && piece.search(/^w/) !== -1)) return false;
    console.log(`Allow drag for piece: ${piece}`);
    return true;
  };

  const onDrop = ({sourceSquare, targetSquare, piece}) => {
    // see if the move is legal
    const move = gameBoard.move({
      from: sourceSquare,
      to: targetSquare
    });
    // illegal move
    if (move === null) return 'snapback';
    
    const address = gameBoard.turn() === 'w' ? playerAddress : opponentAddress;
    updateGameState({address: address, missedCounts: 0});
  };

  return (
    <s.ResponsiveWrapper>
      {renderToolbar()}
      {renderHelpPopup()}
      {renderCreateGamePopup()}
      {renderJoinGamePopup()}
      {renderEndGamePopup()}
      {renderNFTPopup()}
      {renderWelcomePageOrGameBoard()}
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
          dispatch(d.showInfoDialog());
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
              dispatch(b.logout());
            }} />
        ) : (
          <s.StyledButton
            onClick={(e) => {
              e.preventDefault();
              dispatch(b.connectWallet({
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

  // Dialogs
  function renderHelpPopup() {
    return(
      <Dialog open={showInfoDialog} onClose={d.hideDialog}>  
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
                dispatch(d.hideDialog());
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
        open={showCreateGameDialog}
        onClose={(e) => {
          e.preventDefault();
          dispatch(d.hideDialog());
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
                {`Set a base game fee that will be paid by both participants.\nA minimum fee of ${baseGameFee} ETH is required`}
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
                data.errorMessage ? 
                (
                  <s.TextParagraph
                    style={{color: 'red', paddingTop: '10px', textAlign: 'center'}}
                  >
                    {data.errorMessage}
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
                  style={{
                    fontSize: '20px',
                    width: '200px'
                  }} onClick={(e) => {
                    e.preventDefault();
                    dispatch(d.hideDialog());
                  }}
                >
                  Cancel
                </s.StyledButton>
                <s.SpacerSmall />
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
                      dispatch(d.createGame({
                        gameFee: gameFee,
                        address: loggedInAddress,
                        lightSquareColor: lightSquareColor, 
                        darkSquareColor: darkSquareColor,
                        createGameRequest: true,
                      }));
                    } else {
                      dispatch(b.connectWallet({
                        gameFee: gameFee,
                        lightSquareColor: lightSquareColor, 
                        darkSquareColor: darkSquareColor,
                        createGameRequest: true,
                      }));
                    }
                  }}
                >
                  Create Game
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
        open={showJoinGameDialog} 
        onClose={(e) => {
          e.preventDefault();
          dispatch(d.hideDialog());
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
              data.errorMessage ? 
              (
                <s.TextParagraph
                  style={{color: 'red', paddingTop: '10px', textAlign: 'center'}}
                >
                  {data.errorMessage}
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
                style={{
                  fontSize: '20px',
                  width: '200px'
                }} onClick={(e) => {
                  e.preventDefault();
                  dispatch(d.hideDialog());
                }}
              >
                Cancel
              </s.StyledButton>
              <s.SpacerSmall />
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
                    dispatch(d.joinGame({gameId: gameCode, address: loggedInAddress}));
                  } else {
                    dispatch(b.connectWallet({
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
            </s.Container>
          </s.Container>
        </DialogContent>
      </Dialog>
    )
  }

  function renderEndGamePopup() {
    return(
      <Dialog
        open={showEndGameDialog} 
        onClose={(e) => {
          e.preventDefault();
          dispatch(d.clearGameData());
        }}
      >
        <DialogContent>
          <s.Container jc={'center'} ai={'center'}>
            <s.TextDescription
              style={{color: 'black', textAlign: 'center'}}
            >
              { getForfeitDialogTitle() }
            </s.TextDescription>
            <s.StyledButton
              bc={'black'}
              color={'white'}
              style={{marginTop: '20px', marginBottom: '5px'}}
              onClick={(e) => {
                e.preventDefault();
                dispatch(d.clearGameData());
              }}
            >Okay</s.StyledButton>
          </s.Container>
        </DialogContent>
      </Dialog>
    );
  }

  function renderNFTPopup() {
    return(
      <Dialog
        open={showNFTDialog} 
        onClose={(e) => {
          e.preventDefault();
          dispatch(d.hideDialog());
        }}
      >
        <DialogContent>
          <s.Container jc={'center'} ai={'center'}>
            <s.Image
              src={data.nftImage}
            />
            <s.StyledButton
              bc={'black'}
              color={'white'}
              style={{marginTop: '20px', marginBottom: '5px'}}
              onClick={(e) => {
                e.preventDefault();
                dispatch(d.hideDialog());
              }}
            >Okay</s.StyledButton>
          </s.Container>
        </DialogContent>
      </Dialog>
    );
  }

  function renderWelcomePageOrGameBoard() {
    return(
      <s.Container jc={"center"} style={{marginTop: "50px"}}>
        {gameExists && !gameEnded ? renderGameBoard() : renderWelcomePage()}
      </s.Container>
    )
  }

  function renderWelcomePage() {
    return (
      <s.Container key='welcome_page_container' ai={'center'} jc={'center'} fd={'row'} >
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
          {data.errorMessage !== "" ? (
            <s.TextParagraph style={{textAlign:'center', color: 'red', marginTop: '10px'}}>{data.errorMessage}</s.TextParagraph>
          ) : null}
          <s.SpacerMedium />
          <s.Container ai={'center'} jc={'center'} fd={'row'}>
            <s.StyledButton style={{width:'130px', height:'40px'}}
              onClick={(e) => {
                e.preventDefault();
                if (gameConnected) {
                  const winnerAddress = isPlayer ? opponentAddress : playerAddress;
                  const otherAddress = !isPlayer ? opponentAddress : playerAddress;
                  createNFTCard({winnerAddress: winnerAddress, otherAddress: otherAddress});
                  // dispatch(d.showCreateGameDialog());
                } else {
                  dispatch(b.connectWallet({
                    createGameRequest: true, 
                    lightSquareColor: lightSquareColor, 
                    darkSquareColor: darkSquareColor
                  }));
                }
              }}>Create Game</s.StyledButton>
            <s.SpacerMedium />
            <s.StyledButton style={{width:'130px', height:'40px'}}
              onClick={(e) => {
                dispatch(d.showJoinGameDialog());
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

  function renderGameBoard() {
    return(
      <s.Container
        fd={'row'}
        jc={"center"}
        ai={'center'}
      >
        {setChessboard(gameInProgress && isCurrentTurn)}
        <s.SpacerXXLarge/>
        <s.SpacerXXLarge/>
        <s.Container>
          {!gameInProgress ? (
              <s.Container ai={'center'}>
                <s.TextDescription 
                  style={{
                    textAlign: 'justify',
                    fontSize: '18px'
                  }}
                >The game will begin as soon as the opponent joins. Please share the invite code given below with the opponent</s.TextDescription>
                <s.Container jc={'center'} ai={'center'} fd={'row'} style={{marginTop: '24px'}}>
                  <s.TextPageTitle>{gameShortId}</s.TextPageTitle>
                  <s.Identicon 
                    alt='copy to clipboard' 
                    src={copyIcon}
                    style={{marginLeft: '10px'}}
                    onClick={(e) => {
                      e.preventDefault();
                      handleCopyClick(gameShortId);
                    }} />
                </s.Container>
              </s.Container>
            ) 
            : 
            (<s.Container ai={'center'} style={{marginBottom: '20px'}}>
              <s.TextPageTitle 
                  style={{
                    textAlign: 'center',
                    fontSize: '38px'
                  }}
                >{ getLatestStatus() }</s.TextPageTitle>
            </s.Container>)
          }
          {data.errorMessage !== "" ? (
            <s.TextParagraph style={{textAlign:'center', color: 'red', marginTop: '24px'}}>{data.errorMessage}</s.TextParagraph>
          ) : null}
          <s.SpacerMedium />
          <s.Container fd={'row'}>
            <s.Container
              ai={'center'}
              jd={'center'}
              style={{opacity: gameInProgress ? '1' : '0.25'}}
            >
              {addClock({showAnimation: gameInProgress && isPlayerTurn})}
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
              style={{opacity: gameInProgress ? "1" : "0.25"}}
            >
              {addClock({showAnimation: gameInProgress && isOpponentTurn})}
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
        </s.Container>
      </s.Container>
    );
  }

  function setChessboard(isEnable) {
    return(
      <s.Container ref={chessboardRef}>
        <Chessboard
          position={fenString}
          draggable={isEnable}
          orientation={!isOpponent ? 'white' : 'black'}
          lightSquareStyle={{ backgroundColor: `rgb(${lightSquareColor})` }}
          darkSquareStyle={{ backgroundColor: `rgb(${darkSquareColor})` }}
          showNotation={false}
          allowDrag={allowDrag}
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
      </s.Container>
    );
  }

  function addClock({showAnimation}) {
    const clockIndicators = []
    const elapsedTime = h.getDateDifferenceInSeconds(new Date(), updatedAt);
    for (let i = 0; i < 90; i++) {
      const key = `clock-indicator-${i}`;
      clockIndicators[i] = <s.ClockContainer key={key} className='clock-indicator'/>
    }
    const deg = showAnimation ? (elapsedTime / maxTurnTimeInSeconds * 360) : 0;
    const remainingTime = showAnimation ? (maxTurnTimeInSeconds - elapsedTime) : 0;
    return(
      <s.ClockContainer className='clock-wrapper'>
        <s.ClockContainer className='clock-base'>
          <s.ClockContainer className='clock-dial'>
            {clockIndicators}
          </s.ClockContainer>
          {showAnimation ? (
            <s.ClockSecContainer 
              className='clock-second' 
              rotateDeg={deg}
              rotateDuration={remainingTime}
              onAnimationEnd={async (e) => {
                e.preventDefault();
                await togglePlayer();
              }} 
            />
          ) : (
            <s.ClockContainer className='clock-second'/>
          )}
        </s.ClockContainer>
      </s.ClockContainer>
    );
  }

  function togglePlayer() {
    console.log('togglePlayer');
    if (!isCurrentTurn) return null;
    // If the total time of animation has ended that means the user has not played a move. Play a random move instead
    if (reachedMaxMissedTurns()) {
      _endGame();
    } else {
      playRandomMove()
    }
  }

  function playRandomMove() {
    // Return if game is over
    if (gameBoard.game_over()) return

    const moves = gameBoard.moves();
    const move = moves[Math.floor(Math.random() * moves.length)]
    gameBoard.move(move);

    const address = isPlayerTurn ? opponentAddress : playerAddress;
    updateGameState({address: address, missedCounts: missedTurnCount + 1})
  }

  function updateGameState({address, missedCounts}) {
    if (gameModel != null && gameBoard != null && h.isValidString(address)) {
      dispatch(d.togglePlayerState({
        gameModel: gameModel, 
        address: address, 
        fenString: gameBoard.fen(),
        missedTurnCount: missedCounts
      }))
    }
  }

  function _endGame() {
    if (gameInProgress) {
      const winnerAddress = isPlayer ? opponentAddress : playerAddress;
      dispatch(d.endGame({gameShortId: gameShortId, winnerAddress: winnerAddress})); 
    }
  }
}

export default App;