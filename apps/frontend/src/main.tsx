import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { assets } from "./lib/config";
import "./index.css";

// Set favicon from config.
const faviconLink = document.getElementById("favicon") as HTMLLinkElement;
if (faviconLink && assets.favicon) {
  faviconLink.href = assets.favicon;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
