import React from "react";
import Post from "../reusable-components/Post.jsx";
import {mockPosts} from '../mock-data/feed-mock-data/MockPostsAndComments.jsx';
export default function Feed() {
  return (
    <div className="page-wrapper">
      <div className="feature-names">Feed</div>
      <div className="main-content">
         {mockPosts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
