import React from "react";
import Post from "../reusable-components/Post.jsx";
import { mockPosts } from "../mock-data/feed-mock-data/MockPostsAndComments.jsx";
import NewPostButton from "../reusable-components/NewPostButton.jsx";
import Modal from "../reusable-components/Modal.jsx";
import NewPostForm from "../reusable-components/NewPostForm.jsx";

export default function Feed() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const handleSubmitPost = () => {
    console.log("Post submitted!");
    handleCloseModal();
  };
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  return (
    //returning the feed page with posts and a new post button
    <div className="page-wrapper">
      <div className="feature-header">
        <div className="feature-names">Feed</div>
        <NewPostButton onClick={handleOpenModal} />
      </div>

      <div className="main-content">
        {mockPosts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
        {!mockPosts.length && <p>No posts available.</p>}
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <NewPostForm onSubmit={handleSubmitPost} onCancel={handleCloseModal} />
      </Modal>
    </div>
  );
}
