import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    dateOfBirth: "",
    bio: "",
    profilePicture: null,
  });

  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          profilePicture: "File size must be less than 5MB",
        }));
        return;
      }

      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          profilePicture: "File must be an image",
        }));
        return;
      }

      setForm((prev) => ({ ...prev, profilePicture: file }));
      setErrors((prev) => ({ ...prev, profilePicture: "" }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.surname.trim()) newErrors.surname = "Surname is required";

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!form.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      const birthDate = new Date(form.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (age < 13) {
        newErrors.dateOfBirth = "You must be at least 13 years old";
      }

      if (birthDate > today) {
        newErrors.dateOfBirth = "Date of birth cannot be in the future";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await register({
        name: form.name,
        surname: form.surname,
        email: form.email,
        password: form.password,
        dateOfBirth: form.dateOfBirth,
        location: form.location || "Not specified",
        bio: form.bio || "",
        profilePicture: form.profilePicture,
      });

      navigate("/");
    } catch (error) {
      if (error.code === 202) {
        setErrors({
          email: "This email is already registered",
        });
      } else {
        setErrors({
          submit:
            error.message ||
            "Registration failed. Please try again. If error persists, contact support.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card register-card">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                autoComplete="given-name"
                required
              />
              {errors.name && <p className="error">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="surname">Surname</label>
              <input
                id="surname"
                name="surname"
                type="text"
                value={form.surname}
                onChange={handleChange}
                placeholder="Enter your surname"
                autoComplete="family-name"
                required
              />
              {errors.surname && <p className="error">{errors.surname}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
              {errors.email && <p className="error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
                required
              />
              {errors.dateOfBirth && (
                <p className="error">{errors.dateOfBirth}</p>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="new-password"
                required
              />
              {errors.password && <p className="error">{errors.password}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
              />
              {errors.confirmPassword && (
                <p className="error">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location (Optional)</label>
              <input
                id="location"
                name="location"
                type="text"
                value={form.location}
                onChange={handleChange}
                placeholder="Enter your location"
                autoComplete="address-level2"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profilePicture">Profile Picture (Optional)</label>
              <input
                id="profilePicture"
                name="profilePicture"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {errors.profilePicture && (
                <p className="error">{errors.profilePicture}</p>
              )}
              {profilePicPreview && (
                <div className="profile-pic-preview">
                  <img src={profilePicPreview} alt="Profile preview" />
                </div>
              )}
            </div>
          </div>

          <div className="form-group form-group-full">
            <label htmlFor="bio">Bio (Optional)</label>
            <textarea
              id="bio"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows="2"
              maxLength="500"
            />
            <div className="char-counter">{form.bio.length}/500</div>
          </div>

          {errors.submit && <p className="error">{errors.submit}</p>}

          <button
            type="submit"
            className="login-btn primary-button"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
      <Link to="/login" className="register-link">
        Already have an account? Sign in
      </Link>
    </div>
  );
}
