import React from "react";

function User({ src, alt, size = "large" }) {
  const className = `avatar avatar-${size}`;
  return <img src={src} alt={alt} className={className} />;
}

export default User;
