import ParseModule from "parse/dist/parse.min.js";

// Handle both possible shapes: default export or direct export
const Parse = ParseModule.default || ParseModule;

Parse.initialize(
  "qygqOjKKgGQSWK7FXj2ElZD8DqPM8R7CurLav0xl",
  "zWbrrn1KYSBOnh3VXq5L3T7gxukfj9SoKRFXmZnX"
);

Parse.serverURL = "https://parseapi.back4app.com";

export default Parse;
