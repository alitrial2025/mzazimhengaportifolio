import React from "react";
import ReactDOM from "react-dom/client";
import Router from "./Router";
import "./styles.css";
import "./immersive.css";
import "./story.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
);
