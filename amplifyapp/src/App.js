import React from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";

import { withAuthenticator } from "@aws-amplify/ui-react";

import { DynamoDB } from "./components/DynamoDB";

import { Amplify } from "aws-amplify";
import config from "./aws-exports.js";

Amplify.configure(config);

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <DynamoDB />
      </header>
    </div>
  );
}

export default withAuthenticator(App);
