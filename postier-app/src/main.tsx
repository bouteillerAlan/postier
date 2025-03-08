import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "./styles/style.css";
import {ThemeProvider} from "next-themes";
import {RequestDataProvider} from "./contexts/RequestForm.tsx";
import {HistoryDataProvider} from "./contexts/RequestHistory.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider attribute="class">
      <Theme
        radius="small"
        // todo: later we gonna use the user settings here
        // accentColor="teal"
        // grayColor="mauve"
        // scaling="100%"
        // appearance="light"
      >
        <RequestDataProvider>
          <HistoryDataProvider>
            <App/>
          </HistoryDataProvider>
        </RequestDataProvider>
      </Theme>
    </ThemeProvider>
  </React.StrictMode>,
);
