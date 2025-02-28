import React from "react";
import ReactDOM from "react-dom/client";
import { Theme } from "@radix-ui/themes";
import App from "./App";
import "./index.css";
import "@radix-ui/themes/styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Theme appearance="dark" accentColor="blue">
      <App />
    </Theme>
  </React.StrictMode>,
);
