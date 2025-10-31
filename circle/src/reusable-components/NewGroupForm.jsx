import React from "react";

export default function NewGroupForm({ onSubmit, onCancel }) {

    const [groupName, setGroupName] = React.useState('');
    const [description, setDescription] = React.useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ groupName, description });
    };

    return (
      <div className="new-post-form">
        <h2>Start a New Group</h2>
        <form onSubmit={handleSubmit}>
            <input
                
                placeholder="Group Name"
                className="post-textarea"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)} required />
            <textarea
                placeholder="Group Description (What is the group about?)"
                className="post-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)} required >
        </textarea>
        <div className="form-actions">
            <button type="button" className="secondary-button" onClick={onCancel}>
                Cancel
            </button>
            <button type="submit" className="primary-button">
                Create Group
            </button>
        </div>
        </form>
      </div>
    );
  }