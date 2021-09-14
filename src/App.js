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

function App() {
  const ref = useRef();
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
        jc={"center"}
        style={{ color: "white", marginLeft: "auto", paddingLeft: (walletConnected ? "5px" : "65px") }}>
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
        <Flippy 
          flipDirection="horizontal"
          ref={ref}
        >
          <FrontSide>
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
                  ref.current.toggle();
                }}>How to play?</s.StyledButton>
            </s.Container>
            <s.SpacerMedium />
            {blockchain.errorMsg !== "" ? (
              <s.TextDescription>{blockchain.errorMsg}</s.TextDescription>
            ) : null}
            <s.SpacerMedium />
            <Chessboard position="start" />
          </FrontSide>
          <BackSide>
            <s.Container ai={"center"}>
              <s.TextDescription>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.</s.TextDescription>
              <s.StyledButton style={{marginTop:"50px"}} onClick={() => {
                ref.current.toggle();
              }}>Go back</s.StyledButton>
            </s.Container>
          </BackSide>
        </Flippy>
      </s.Container>
    );
  }
}

export default App;
