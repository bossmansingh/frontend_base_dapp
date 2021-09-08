import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import { create } from "ipfs-http-client";

export const StyledButton = styled.button`
  padding: 8px;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);

  useEffect(() => {
    if (blockchain.account !== "" && blockchain.gameContract !== null) {
      dispatch(fetchData(blockchain.account));
      //console.log("Account 1: " + blockchain.account);
      console.log("Blockchain: " + blockchain);
      console.log("Contract Address: " + blockchain.gameContract.address);
    }
<<<<<<< HEAD
  }, [blockchain.gameContract, dispatch]);
=======
  }, [blockchain.smartContract, dispatch]);
>>>>>>> 894d5c47a54bf99eb188d3f948996214c95dda97

  return (
    <s.Screen>
      {blockchain.account === "" || blockchain.gameContract === null ? (
        <s.Container flex={1} ai={"center"} jc={"center"}>
          <s.TextTitle>Connect to the Blockchain</s.TextTitle>
          <s.SpacerSmall />
          <StyledButton
            onClick={(e) => {
              e.preventDefault();
              dispatch(connect());
            }}>
            CONNECT
          </StyledButton>
          <s.SpacerSmall />
          {blockchain.errorMsg !== "" ? (
            <s.TextDescription>{blockchain.errorMsg}</s.TextDescription>
          ) : null}
        </s.Container>
      ) : (
        <s.Container flex={1} ai={"center"} style={{ padding: 24 }}>
          <s.TextTitle style={{ textAlign: "center" }}>
<<<<<<< HEAD
            Name: {data.name}
=======
            Name: {data.name}.
>>>>>>> 894d5c47a54bf99eb188d3f948996214c95dda97
          </s.TextTitle>
        </s.Container>
      )}
    </s.Screen>
  );
}

export default App;
