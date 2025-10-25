import React from "react";
import Post from "../reusable-components/Post.jsx";
export default function Feed() {
  return (
    <div className="page-wrapper">
      <div className="feature-names">Feed</div>
      <div className="main-content">
        <Post />
        <Post />
        <Post />
        <Post />
      </div>
    </div>
  );
}
