import React, { useEffect, useState, useRef } from "react";
import Flippy, { FrontSide, BackSide } from 'react-flippy';
import { useDispatch, useSelector } from "react-redux";
import { moralisAuthenticate, createGame } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
// import styled from "styled-components";
// import { create } from "ipfs-http-client";
import Chessboard from "chessboardjsx";
import logo from "./assets/chessboard_logo.jpg";

const gameInstructions = `Welcome to the world of CHKMATE!
It is a NFT based game of chess where every player have a chance to mint a unique CHKMATE NFT win card, in half the price. Rules are simple here, to create a new game or to join an existing game it would cost you 0.05 ETH. Each player has to deposits the same amount into the contract and the winner receives the deposited ETH* in form of CHKMATE NFT. Each card has unique characteristics about the game which includes winning piece, winning board, winning time and total kills.

Game Rules:
1. To create a new game a fee of 0.05 ETH is to be deposited into the contract. 
2. Once a game is created a unique code will be generated that you can share with the other player for them to join the game. The other player will have 30 minutes to join before it auto-forfeits. In that case, the deposited ETH will be returned to your wallet *.
3. Once a game is started each player will have a two minute window to make a move. If no move is made within the given timeframe the turn will skip to the next player.
4. If any player for any reason disconnects from the game, it will be considered as a forfeit and the other player will win CHKMATE NFT card **.
5. As per the rules of chess, a game finishes when check-and-mate happens. The piece that makes the final check-mate move will be considered as the winning piece.



* Minus the gas fees
** this card will not include a winning piece`;

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
  const ref = useRef();
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const account = blockchain.account;
  const contract = blockchain.gameContract;
  const walletConnected = account !== null && account !== "";
  const contractFetched = contract != null;
  console.log("lightSquareColor: ", lightSquareColor);
  console.log("darkSquareColor: ", darkSquareColor);
  console.table(blockchain);
  console.table(data);
  console.table(account);

  useState(() => {
    console.log("UseState");
  });
  useRef(() => {
    console.log("UseRef");
  });
  useEffect(() => {
    console.log("UseEffect");
    if (walletConnected && contractFetched !== null) {
      dispatch(fetchData(account));
    }
  }, [account, walletConnected, contractFetched, dispatch]);

  return (
    <s.Screen>
      {renderToolbar()}
    {/* 
      If account connected or not-connected and no NFTs minted show the chessboard with start game button
      If account connected or not-connected and NFTs minted show minted NFTs with start game button
      TODO: Show minted NFTs (in carousel) 
    */}
      {renderWelcomePage()}
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
        <s.HelpButton style={{width:"40px", height:"40px"}}
              onClick={(e) => {
                e.preventDefault();
                // TODO: Show instructions dialog
              } 
            }>
              ?
            </s.HelpButton>
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
              src={(blockchain.identiconUrl != null ? blockchain.identiconUrl : logo)} />
          ) : (
            <s.StyledButton
              onClick={(e) => {
                e.preventDefault();
                // dispatch(connect());
                dispatch(moralisAuthenticate());
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
      <s.Container ai={"center"} jc={"center"} style={{paddingTop: "50px"}}>
        <s.Container ai={"center"} jc={"center"} fd={"row"}>
          <s.StyledButton style={{width:"130px", height:"40px"}}
            onClick={(e) => {
              e.preventDefault();
              if (walletConnected && contractFetched) {
                dispatch(createGame());
              } else {
                dispatch(moralisAuthenticate(true));
              }
            }}>Create Game</s.StyledButton>
          <s.SpacerMedium />
          <s.StyledButton style={{width:"130px", height:"40px"}}
            onClick={(e) => {
              e.preventDefault();
              // Show join game dialog
            }}>Join Game</s.StyledButton>
        </s.Container>
        <s.SpacerMedium />
        {blockchain.errorMsg !== "" ? (
          <s.TextDescription>{blockchain.errorMsg}</s.TextDescription>
        ) : null}
        <s.SpacerMedium />
        {setChessboard()}
      </s.Container>
    );
  }

  function setChessboard() {
    return(
      <Chessboard
        position="start" 
        draggable={false}
        lightSquareStyle={{ backgroundColor: `rgb(${lightSquareColor})` }}
        darkSquareStyle={{ backgroundColor: `rgb(${darkSquareColor})` }} />
    );
  }
}

export default App;
