import React, { useState } from "react";
import { updateProfile } from "../services/ProfileService";
import User from "../components/User";
import Card from "../components/ProfileCard";

function EditProfileModal({ user, onClose }) {
  const [bio, setBio] = useState(user.bio || "");
  const [photoFile, setPhotoFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateProfile(user.id, bio, photoFile);
      window.location.reload();

      onClose();
    } catch (err) {
      setError(err.message || "Failed to save profile. Check network.");

      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5000000) {
      setError("File size exceeds 5MB limit.");
      setPhotoFile(null);
      return;
    }
    setPhotoFile(file);
    setError(null);
  };

  return (
    <Card>
      <div className="edit-profile-form-inner" style={{ padding: "20px" }}>
        <h3
          className="feature-names"
          style={{
            fontSize: "1.5em",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          Edit Your Profile
        </h3>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          {/* PROFILE PICTURE UPLOAD */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              justifyContent: "center",
            }}
          >
            <User src={user.picture} alt="Current Photo" size="medium" />
            <label
              className="secondary-button"
              htmlFor="photo-upload"
              style={{ cursor: "pointer", flexShrink: 0 }}
            >
              Change Photo
            </label>
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>
          <div style={{ textAlign: "center", minHeight: "18px" }}>
            {photoFile && (
              <p style={{ color: "green", fontSize: "0.9em" }}>
                {photoFile.name} ready to upload.
              </p>
            )}
          </div>

          {/* BIO EDITOR */}
          <div>
            <label
              htmlFor="bio-input"
              style={{
                fontWeight: "bold",
                display: "block",
                marginBottom: "5px",
              }}
            >
              Bio
            </label>
            <textarea
              id="bio-input"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows="4"
              className="comment-input"
              placeholder="Tell people about yourself..."
              style={{ width: "100%", resize: "vertical" }}
            />
          </div>

          {/* ACTIONS */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "10px",
            }}
          >
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {error && (
            <p style={{ color: "red", textAlign: "center", marginTop: "15px" }}>
              {error}
            </p>
          )}
        </form>
      </div>
    </Card>
  );
}

export default EditProfileModal;
