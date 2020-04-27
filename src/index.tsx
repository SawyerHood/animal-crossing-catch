import * as React from "react";

import { render } from "react-dom";
import * as serviceWorker from "./serviceWorker";

import App from "./App";
import "./i18n";
const rootElement = document.getElementById("root");
render(<App />, rootElement);

serviceWorker.register();
