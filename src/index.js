import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import store from "./redux/store";
import { Provider } from "react-redux";
import "./styles/reset.css";
import "./styles/theme.css";

const Moralis = require('moralis');

Moralis.initialize("1NlwHTGcv2MI4dC4T5Z0jpDQrXj2vaCj4Fnzs5ZQ");
Moralis.serverURL = "https://hgqfneavzzl0.bigmoralis.com:2053/server";

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
