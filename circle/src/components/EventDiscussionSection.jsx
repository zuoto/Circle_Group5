import React from "react";
import Post from "../reusable-components/Post.jsx";
import NewPostButton from "../reusable-components/NewPostButton.jsx";

export default function EventDiscussionSection({
  posts,
  loadingPosts,
  canPost,
  onOpenPostModal,
}) {
  return (
    <>
      <div className="group-discussion-header">
        <div className="discussion-name">Event Discussion</div>
        {canPost && (
          <NewPostButton
            onClick={onOpenPostModal}
            hoverText="Add Post"
            customClass="small-post-button"
          />
        )}
      </div>

      {loadingPosts && <p>Loading posts...</p>}

      {!loadingPosts && posts.length === 0 && (
        <p>No posts yet. Start the conversation!</p>
      )}

      {!loadingPosts &&
        posts.map((post) => (
          <Post key={post.id} post={post} isGroupPost={false} />
        ))}
    </>
  );
}
