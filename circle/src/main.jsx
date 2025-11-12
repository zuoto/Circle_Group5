import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Parse from "parse/types/Parse.js";

Parse.initialize(
  "CUkZhmAmKoe3fzlNZXxQyEKIiHOi1OVdumHzkjF5",
  "n0HsDaRxmngRSijFPAM3g8XiHkAUUW9DL2LZI0Ck"
);

Parse.serverURL = "https://parseapi.back4app.com";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
