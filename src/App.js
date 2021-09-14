import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { moralisAuthenticate, createGame } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
// import styled from "styled-components";
// import { create } from "ipfs-http-client";
import Chessboard from "chessboardjsx";
import logo from "./assets/chessboard_logo.jpg";


function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const account = blockchain.account;
  const contract = blockchain.gameContract;
  const walletConnected = account !== null && account !== "";
  const contractFetched = contract != null;
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
      {renderWelcomePage()}
    </s.Screen>
  );

  function renderToolbar() {
    return <s.Container
      style={{ padding: 14 }}
      ai={"center"}
      fd={"row"}>
      <s.TextTitle
        ai={"center"}
        style={{ color: "white", marginLeft: "auto", paddingLeft: (walletConnected ? "50px" : "110px") }}>
        CHKMATE
      </s.TextTitle>

      <s.Container style={{ marginLeft: "auto" }} >
        { walletConnected && blockchain.identiconUrl != null ? (
          <s.Identicon alt="identicon" src={(blockchain.identiconUrl != null ? blockchain.identiconUrl : logo)} />
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
    // If account connected or not-connected and no NFTs minted show the chessboard with start game button
    
    // If account connected or not-connected and NFTs minted show minted NFTs with start game button
    // TODO: Show minted NFTs (in carousel)
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
              // TODO: show how to play view
            }}>How to play?</s.StyledButton>
        </s.Container>
        <s.SpacerMedium />
        {blockchain.errorMsg !== "" ? (
          <s.TextDescription>{blockchain.errorMsg}</s.TextDescription>
        ) : null}
        <s.SpacerMedium />
        <Chessboard position="start" />
      </s.Container>
    );
  }
}

export default App;
