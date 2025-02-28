import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "./style.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Theme
      accentColor="violet"
      grayColor="mauve"
      radius="small"
      appearance="dark"
    >
      <App />
      {/* <ThemePanel /> for debugging radix theme */}
    </Theme>
  </React.StrictMode>,
);
