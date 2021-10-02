import React, { useEffect, useState, useRef } from "react";
import { connect, useDispatch, useSelector } from "react-redux";

import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";

import Chessboard from "chessboardjsx";

import { connectWallet, fetchCachedAccount, logout } from "./redux/blockchain/blockchainActions";
import { fetchData, createGame, joinGame, toggleInfoDialog, toggleJoinGameDialog } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import "./styles/clockStyle.css";

// import styled from "styled-components";
// import { create } from "ipfs-http-client";
import logo from "./assets/chessboard_logo.jpg";

const gameInstructions = "It is a NFT based game of chess where every player have a chance to mint a unique CHKMATE NFT win card, in half the price. Rules are simple here, to create a new game or to join an existing game it would cost you 0.05 eth. Each player has to deposits the same amount into the contract and the winner receives the CHKMATE NFT. Each card has unique characteristics about the game which includes winning piece, winning board, winning time and total kills.";
const rule1 = "1. To create a new game a fee of 0.05 eth is to be deposited into the contract."; 
const rule2 = "2. Once a game is created a unique code will be generated that you can share with the other player for them to join. The other player will have 30 minutes to join before the game auto-forfeits. In that case, the deposited eth will be returned to your wallet[1].";
const rule3 = "3. Once a game is started each player will have a two minute window to make a move. If no move is made within the given timeframe the turn will skip to the next player.";
const rule4 = "4. If any player for any reason disconnects from the game, it will be considered as a forfeit and the other player will win CHKMATE NFT card[2].";
const rule5 = "5. A game finishes when one of the player plays a check-mate move. The piece that makes the final move will be considered as the winning piece.";

// The random color should be generated when the game starts, before 
// that some default color should be used
const lightSquareColor = getLightSquareColor();
const darkSquareColor = getDarkSquareColor();

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

function App() {
  //
  
  const ref = useRef();
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const address = blockchain.address;
  const contract = blockchain.gameContract;
  const walletConnected = address != null && address !== "";
  const contractFetched = contract != null;
  const gameConnected = walletConnected && contractFetched;
  const gameStarted = data.gameCode != null && data.gameCode !== "";

  console.log("App() | Address: " + address);
  console.log("App() | walletConnected: " + walletConnected);
  console.log("App() | contractFetched: " + contractFetched);
  console.log("App() | gameConnected: " + gameConnected);
  console.log("App() | gameStarted: " + gameStarted);
  console.log("App() | challenger: " + data.challenger);
  console.log("App() | challengAcceptor: " + data.challengAcceptor);

  const [player, _setPlayer] = useState(false);
  const [opponent, _setOpponent] = useState(false);

  if (data.challenger != null && data.challenger !== "" && data.challenger.toLowerCase() == address.toLowerCase() && !player) {
    console.log("App() | challenger equal: " + data.challenger.toLowerCase() == address.toLowerCase());
    console.log("App() | set player");
    _setPlayer(true);
    _setOpponent(false);
  } else if (data.challengAcceptor != null && data.challengAcceptor !== "" && data.challengAcceptor.toLowerCase() == address.toLowerCase() && !opponent) {
    console.log("App() | challengAcceptor equal: " + data.challengAcceptor.toLowerCase() == address.toLowerCase());
    console.log("App() | set opponent");
    _setPlayer(false);
    _setOpponent(true);
  }

  const showInformationDialog = () => {
    dispatch(toggleInfoDialog(true));
  };
  
  const hideInformationDialog = () => {
    dispatch(toggleInfoDialog(false));
  };

  const showJoinGameDialog = () => {
    dispatch(toggleJoinGameDialog(true));
  };

  const hideJoinGameDialog = () => {
    dispatch(toggleJoinGameDialog(false));
  };

  const [gameCode, _setGameCode] = useState("");

  const handleInput = (event) => {
    console.log("Text: ", event.target.value);
    _setGameCode(event.target.value);
  };

  useEffect(() => {
    if (gameConnected) {
      dispatch(fetchData(address));
    }
  }, [address, gameConnected, dispatch]);

  // Init account from cache
  if (!walletConnected) {
    dispatch(fetchCachedAccount());
  }
  return (
    <s.Screen>
      {renderToolbar()}
      {/* 
        If account connected or not-connected and no NFTs minted show the chessboard with start game button
        If account connected or not-connected and NFTs minted show minted NFTs with start game button
        TODO: Show minted NFTs (in carousel) 
      */}
      {renderHelpPopup()}
      {renderJoinGamePopup()}
      {gameStarted ? renderGameBoard() : renderWelcomePage()}
    </s.Screen>
  );

  function renderToolbar() {
    return <s.Container
      style={{ 
        padding: 8 
      }}
      ai={"center"}
      fd={"row"}
      >
        <s.HelpButton id="help_button"
          style={{width:"40px", height:"40px"}}
          onClick={(e) => {
            showInformationDialog();
            e.preventDefault();
          } 
        }>?</s.HelpButton>
        <s.TextPageTitle
          style={{ 
            color: "white", 
            marginLeft: "auto", 
            paddingLeft: (walletConnected ? "0px" : "60px") 
          }}
        >
          CHKMATE
        </s.TextPageTitle>
        
        <s.Container 
          style={{ 
            marginLeft: "auto" 
          }}
        >
          { walletConnected && blockchain.identiconUrl != null ? (
            <s.Identicon 
              alt="identicon" 
              src={(blockchain.identiconUrl != null ? blockchain.identiconUrl : logo)}
              onClick={(e) => {
                e.preventDefault();
                dispatch(logout());
              }} />
          ) : (
            <s.StyledButton
              onClick={(e) => {
                e.preventDefault();
                dispatch(connectWallet());
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
      <s.Container ai={"center"} jc={"center"} style={{padding: "50px"}}>
        <s.Container ai={"center"} jc={"center"} fd={"row"}>
          <s.StyledButton style={{width:"130px", height:"40px"}}
            onClick={(e) => {
              e.preventDefault();
              if (gameConnected) {
                dispatch(createGame(address));
              } else {
                dispatch(connectWallet(true, false, ""));
              }
            }}>Create Game</s.StyledButton>
          <s.SpacerMedium />
          <s.StyledButton style={{width:"130px", height:"40px"}}
            onClick={(e) => {
              showJoinGameDialog();
              e.preventDefault();
            }}
          >
            Join Game
          </s.StyledButton>
        </s.Container>
        <s.SpacerMedium />
        {blockchain.errorMsg !== "" ? (
          <s.TextDescription>{blockchain.errorMsg}</s.TextDescription>
        ) : null}
        <s.SpacerMedium />
        {setChessboard(false)}
      </s.Container>
    );
  }

  function setChessboard(isEnable) {
    return(
      <Chessboard
        position="start" 
        draggable={isEnable}
        lightSquareStyle={{ backgroundColor: `rgb(${lightSquareColor})` }}
        darkSquareStyle={{ backgroundColor: `rgb(${darkSquareColor})` }}
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
      <Dialog open={data.showInfoDialog} onClose={hideInformationDialog}>  
        <DialogContent>
          <s.Container 
            ai={"center"} 
            style={{
              paddingBottom: "20px"
            }}>
            <s.TextTitle 
              style={{
                color: "black", 
                textAlign: "center"
              }}
            >
              Welcome to the world of CHKMATE!
            </s.TextTitle>
            <s.SpacerXSmall/>
            <s.TextParagraph 
              style={{
                color: "black"
              }}
            >
              {gameInstructions}
            </s.TextParagraph>
            <s.SpacerMedium/>
            <s.Container>
              <s.TextSubTitle 
                style={{
                  color: "black"
                }}
              >
                Game rules:
              </s.TextSubTitle>
              <s.TextParagraph 
                style={{
                  padding: "12px", 
                  color: "black"
                }}
              >
                {rule1}
              </s.TextParagraph>
              <s.TextParagraph 
                style={{
                  padding: "12px", 
                  color: "black"
                }}
                >
                  {rule2}
                </s.TextParagraph>
              <s.TextParagraph 
                style={{
                  padding: "12px", 
                  color: "black"
                }}
              >
                {rule3}
              </s.TextParagraph>
              <s.TextParagraph 
                style={{
                  padding: "12px",
                  color: "black"
                }}
              >
                {rule4}
              </s.TextParagraph>
              <s.TextParagraph 
                style={{
                  padding: "12px", 
                  color: "black"
                }}
              >
                {rule5}
              </s.TextParagraph>
              <s.SpacerSmall />
              <s.TextParagraph 
                style={{
                  color:"black",
                  paddingLeft:"12px",
                  fontSize: "14px"
                }}
              >
                [1]Minus the gas fees
              </s.TextParagraph>
              <s.TextParagraph 
                style={{
                  color:"black",
                  paddingLeft:"12px",
                  fontSize: "14px"
                }}
              >
                [2]The winning NFT card will not include a winning piece
              </s.TextParagraph>
            </s.Container>
            <s.SpacerMedium/>
            <s.StyledButton 
              bc={"black"}
              color={"white"}
              style={{
                fontSize: "20px"
              }} 
              onClick={(e)=> {
                hideInformationDialog();
                e.preventDefault();
              }}
            >
              Close
            </s.StyledButton>
          </s.Container>
        </DialogContent>
      </Dialog>
    );
  }

  function renderJoinGamePopup() {
    return(
      <Dialog 
        open={
          data.showJoinGameDialog
        } 
        onClose={(e) => {
          hideJoinGameDialog();
          e.preventDefault();
        }}
      >
        <DialogContent>
          <s.Container 
            ai={"center"} 
            jc={"center"}
            style={{
              paddingBottom: "20px",
              paddingLeft: "10px",
              paddingRight: "10px"
            }}
          >
            <s.TextTitle 
              style={{
                color: "black", 
                textAlign: "center"
              }}
            >
              ENTER GAME CODE
            </s.TextTitle>
            <s.SpacerSmall />
            <s.InputContainer 
              style={{textAlign: "center"}}
              placeholder={"Game Code"} 
              onChange={(e) => {
                handleInput(e);
                e.preventDefault();
              }} />
            {
              data.errorMsg ? 
              (
                <s.TextParagraph
                  style={{color: "red", paddingTop: "10px", textAlign: "center"}}
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
                bc={"black"}
                color={"white"}
                style={{
                  fontSize: "20px",
                  width: "200px"
                }} 
                onClick={(e) => {
                  if (gameConnected) {
                    dispatch(joinGame(address, gameCode));
                  } else {
                    dispatch(connectWallet(false, true, gameCode));
                  }
                  e.preventDefault();
                }}
              >
                Join Game
              </s.StyledButton>
              <s.SpacerSmall />
              <s.StyledButton 
                flex={1}
                style={{
                  fontSize: "20px",
                  width: "200px"
                }} onClick={(e) => {
                  hideJoinGameDialog();
                  e.preventDefault();
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
    const gameStarted = data.gameStarted;
    return(
      <s.Container
        fd={"row"}
        jc={"center"}
        ai={"center"}
        style={{paddingTop: "138px"}}
      >
        {setChessboard(gameStarted)}
        <s.SpacerXXLarge/>
        <s.Container
          ai={"center"}
          jd={"center"}
          style={{opacity: player ? "1" : "0.25"}}
        >
          {addClock(player)}
          <s.SpacerMedium/>
          <s.TextSubTitle
            style={{
              textAlign: "center", 
              fontFamily: "default-font"
            }}
          >You</s.TextSubTitle>
        </s.Container>
        <s.SpacerLarge/>
        <s.Container
          ai={"center"}
          jd={"center"}
          style={{opacity: opponent ? "1" : "0.25"}}
        >
          {addClock(opponent)}
          <s.SpacerMedium/>
          <s.TextSubTitle
            style={{
              textAlign: "center", 
              fontFamily: "default-font"
            }}
          >Opponent</s.TextSubTitle>
        </s.Container>
      </s.Container>
    );
  }

  function addClock(isEnabled) {
    const clockIndicators = []
    for (let i = 0; i < 90; i++) {
      const key = "clock-indicator-"+i;
      clockIndicators[i] = <s.ClockContainer key={key} className="clock-indicator"/>
    }
    return(
      <s.ClockContainer className="clock-wrapper">
        <s.ClockContainer className="clock-base">
          <s.ClockContainer className="clock-dial">
            {clockIndicators}
          </s.ClockContainer>
          <s.ClockContainer className="clock-second" rotate={isEnabled ? 1 : 0} 
            onAnimationEnd={() => togglePlayerState()} 
          />
          <s.ClockContainer className="clock-center"/>
        </s.ClockContainer>
      </s.ClockContainer>
    );
  }

  function togglePlayerState() {
    _setPlayer(!player);
    _setOpponent(!opponent);
  }
}

export default App;
