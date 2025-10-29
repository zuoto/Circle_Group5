export default function NewPostForm({ onSubmit, onCancel }) {
  return (
    <div className="new-post-form">
      <h2>Create New Post</h2>
      <textarea
        className="post-textarea"
        placeholder="When do you have time to meet your friends?"
      ></textarea>
      <datetime className="post-timestamp">Select Date & Time</datetime>
      <div className="form-actions">
        <button className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
        <button className="primary-button" onClick={onSubmit}>
          Post
        </button>
      </div>
    </div>
  );
}
