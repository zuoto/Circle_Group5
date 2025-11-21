import React from "react";

export default function NewGroupForm({ onSubmit, onCancel }) {

    const [groupName, setGroupName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [coverPhotoFile, setCoverPhotoFile] = React.useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ groupName, description, coverPhotoFile });
    };

    return (
      <div className="new-post-form">
        <h2>Start a New Group</h2>
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Group Name"
                className="post-textarea"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)} required />

        <div className="file-input-wrapper">
            <input
                type="file"
                id="coverPhotoUpload"
                accept="image"
                onChange={(e) => setCoverPhotoFile(e.target.files[0])} 
                className="hidden-file-input"
                />
                <label htmlFor="coverPhotoUpload" className="styled-file-label post-textarea">
                    {coverPhotoFile ? coverPhotoFile.name : 'Choose Group Header Image...'}
                </label>
        </div>

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