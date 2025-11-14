import React from "react";
import Post from "../reusable-components/Post.jsx";
import NewPostButton from "../reusable-components/NewPostButton.jsx";
import Modal from "../reusable-components/Modal.jsx";
import NewPostForm from "../reusable-components/NewPostForm.jsx";
import getFeedPosts from "../services/feed/getFeedPosts.js";

export default function Feed() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPosts = await getFeedPosts();
      setPosts(fetchedPosts);
    } catch (err) {
      console.error("Failed to load posts:", err);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async () => {
    handleCloseModal();
    await loadPosts();
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="page-wrapper">
      <div className="feature-header">
        <div className="feature-names">Feed</div>
        <NewPostButton onClick={handleOpenModal} hoverText="add a post" />
      </div>

      <div className="main-content">
        {loading && <p>Loading posts...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && posts.length === 0 && <p>No posts available.</p>}
        {!loading &&
          !error &&
          posts.map((post) => <Post key={post.id} post={post} />)}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <NewPostForm onSubmit={handleSubmitPost} onCancel={handleCloseModal} />
      </Modal>
    </div>
  );
}
