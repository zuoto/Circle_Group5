import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./auth/AuthProvider";
import Parse from "parse";

// Initialize Parse with proper error handling
try {
  Parse.initialize(
    "qygqOjKKgGQSWK7FXj2ElZD8DqPM8R7CurLav0xl",
    "zWbrrn1KYSBOnh3VXq5L3T7gxukfj9SoKRFXmZnX"
  );
  Parse.serverURL = "https://parseapi.back4app.com";
} catch (error) {
  console.error("Parse initialization error:", error);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
