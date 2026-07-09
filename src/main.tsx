import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

if (import.meta.env.DEV) {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("width(-1) and height(-1)")
    ) {
      return;
    }
    originalWarn(...args);
  };
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);