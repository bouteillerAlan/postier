import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@radix-ui/themes/styles.css";
import "./styles/style.css";
import {RequestDataProvider} from "./contexts/RequestContext.tsx";
import {HistoryDataProvider} from "./contexts/HistoryContext.tsx";
import {SettingProvider} from "./contexts/SettingContext.tsx";

function RootComponent() {
  return (
    <SettingProvider>
      <RequestDataProvider>
        <HistoryDataProvider>
          <App/>
        </HistoryDataProvider>
      </RequestDataProvider>
    </SettingProvider>

  )
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RootComponent/>
  </React.StrictMode>,
);
