import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Register() {
  const navigate = useNavigate(); //redirects automatically after registration
  const { login } = useAuth(); //custom hook to access auth methods
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "", //this should be optional?
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  //handle update of form fields
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  //basic checks if inputs are valid
  function validate() {
    //check if all required fields are filled
    if (
      !form.name.trim() ||
      !form.surname.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      return "All fields except location are required.";
    }
    // check if email is an email (regex checking for @ and . )
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      return "Enter a valid email address.";
    }
    // check password length is over 6
    if (form.password.length < 6) {
      return "Password must be at least 6 characters.";
    }
    //check if passwords match
    if (form.password !== form.confirmPassword) {
      return "Passwords do not match.";
    }
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    //on submit, validate inputs and display relevant error if needed
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    try {
      await Register({ email: form.email, password: form.password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              autoComplete="name"
              required
            />
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
              autoComplete="surname"
              required
            />
          </div>

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
          </div>

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
          </div>
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              type="text"
              value={form.location}
              onChange={handleChange}
              placeholder="Enter your location"
              autoComplete="location"
              optional
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button
            type="submit"
            className="login-btn primary-button"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Account"} //change button text
            when loading
          </button>
        </form>
      </div>
      <Link to="/login" className="register-link">
        Already have an account? Sign in
      </Link>
    </div>
  );
}
