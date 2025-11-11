import React from "react";

//renders user's avatar
function Avatar({ src, alt, size = "large" }) {
  const className = `avatar avatar--${size}`;

  return <img src={src} alt={alt} className={className} />;
}

export default Avatar;
