import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./auth/AuthProvider";

// Wait for Parse to load from CDN
function initializeApp() {
  const Parse = window.Parse;
  // Initialize Parse
  try {
    Parse.initialize(
      "qygqOjKKgGQSWK7FXj2ElZD8DqPM8R7CurLav0xl",
      "zWbrrn1KYSBOnh3VXq5L3T7gxukfj9SoKRFXmZnX"
    );

    Parse.serverURL = "https://parseapi.back4app.com/";

    console.log("parse initialized successfully");
  } catch (error) {
    console.error("parse error", error); //for debugging purposes
  }

  // Render app after Parse is ready
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>
  );
}

initializeApp();
