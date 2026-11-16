import React from "react";
import ReactDOM from "react-dom/client";
import Router from "./Router";
import "./styles.css";
import "./immersive.css";
import "./story.css";
import "./projects.css";
import "./performance.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
);
