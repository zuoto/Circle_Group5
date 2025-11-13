import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Parse from "parse/dist/parse.min.js";


Parse.initialize(
  "qygqOjKKgGQSWK7FXj2ElZD8DqPM8R7CurLav0xl",
  "zWbrrn1KYSBOnh3VXq5L3T7gxukfj9SoKRFXmZnX"
);

/*"CUkZhmAmKoe3fzlNZXxQyEKIiHOi1OVdumHzkjF5",
  "n0HsDaRxmngRSijFPAM3g8XiHkAUUW9DL2LZI0Ck"*/

Parse.serverURL = "https://parseapi.back4app.com";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
