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
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // validate fields
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.surname.trim()) newErrors.surname = "Surname is required";

    //TODO: MAKE ERROR FOR ACCOUNT ALREADY EXISTS!!
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
      //email format construction check with regex
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      //password has to be over 6 chars
      // TODO: should we include more checks??
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      //passwords do not match check
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

      // chcek age is above 13
      // TODO: ask if we should we keep this??
      if (age < 13) {
        newErrors.dateOfBirth = "You must be at least 13 years old";
      }

      //make sure someone is not doing whatever
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
        location: form.location || "Not specified", //since location is optional
      });

      navigate("/");
    } catch (error) {
      setErrors({
        submit:
          error.message ||
          "Registration failed. Please try again. If error persists, contact support.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Register</h1>
        <form onSubmit={handleSubmit} noValidate>
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

          {errors.submit && <p className="error">{errors.submit}</p>}

          <button
            type="submit"
            className="login-btn primary-button"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>
      <Link to="/login" className="register-link">
        Already have an account? Sign in
      </Link>
    </div>
  );
}
