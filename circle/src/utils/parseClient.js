const Parse = window.Parse;

if (!Parse) {
  console.error("Parse SDK not found on window object.");
}

export default Parse;
