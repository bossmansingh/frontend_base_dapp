import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { moralisAuthenticate } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
// import styled from "styled-components";
// import { create } from "ipfs-http-client";
import Chessboard from "chessboardjsx";
import logo from "./assets/chessboard_logo.png";
import * as blockies from "./utils/Blockies";

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
  let identiconUrl;
  if (walletConnected) {
    const seed = account.get("ethAddress");
    console.log("Address: ", seed);
    identiconUrl = blockies.create({
      seed: seed,
      size: 5,
      scale: 10
    }).toDataURL();
  } else {
    identiconUrl = "";
  }
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
      style={{ padding: 14 }}
      ai={"center"}
      fd={"row"}
    >
      <s.TextTitle
        ai={"center"}
        style={{ color: "white", marginLeft: "auto", paddingLeft: (walletConnected ? "50px" : "110px") }}
      >
        CHKMATE
      </s.TextTitle>

      <s.Container style={{ marginLeft: "auto" }} >
        { walletConnected ? (
          <s.Identicon alt="identicon" src={identiconUrl} />
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
