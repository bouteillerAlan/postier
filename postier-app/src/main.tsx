import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "./style.css";
import {ThemeProvider} from "next-themes";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider attribute="class">
      <Theme
        radius="small"
        // todo: later we gonna use the user settings here
        // accentColor="teal"
        // grayColor="mauve"
        // scaling="100%"
      >
        <App />
      </Theme>
    </ThemeProvider>
  </React.StrictMode>,
);
