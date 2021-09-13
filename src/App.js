import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect, moralisAuthenticate } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import { create } from "ipfs-http-client";
import Chessboard from "chessboardjsx";


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
  
  useEffect(() => {
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
      style={{ backgroundColor: "white", padding: 14 }}
      ai={"center"}
      fd={"row"}
    >
      <s.TextTitle
        ai={"center"}
        style={{ color: "black", marginLeft: "auto", paddingLeft: "110px" }}
      >
        CHKMATE
      </s.TextTitle>

      <s.Container width={"200px"} style={{ marginLeft: "auto" }} >
        { walletConnected ? (
          <s.Identicon />
        ) : (
          <s.StyledButton
            onClick={(e) => {
              e.preventDefault();
              // dispatch(connect());
              dispatch(moralisAuthenticate());
            } }
          >
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
      <s.Container flex={1} ai={"center"} jc={"center"}>
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
