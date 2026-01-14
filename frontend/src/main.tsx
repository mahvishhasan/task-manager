import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx"; // <-- IMPORTANT: explicit extension

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
