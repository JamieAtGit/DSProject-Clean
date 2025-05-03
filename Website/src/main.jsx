import React from "react";
import ReactDOM from "react-dom/client";
<<<<<<< HEAD
import App from "./App.jsx";
import "./index.css"; // or your styling file
=======
import App from "./App";
import { Toaster } from "react-hot-toast";
import "./index.css";
>>>>>>> 90966f83 (Fix weight logic and distance values in estimate_emissions endpoint)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
<<<<<<< HEAD
=======
    <Toaster position="top-right" />
>>>>>>> 90966f83 (Fix weight logic and distance values in estimate_emissions endpoint)
  </React.StrictMode>
);
