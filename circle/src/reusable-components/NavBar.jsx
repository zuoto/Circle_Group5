import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "../auth/AuthProvider";

export default function NavBar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="h-screen p-4">
      <div className="shape">
        <img src={logo} alt="Logo" className="logo-top-left" />
      </div>
      <ul className="navbuttons">
        <li className="nav-item">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Feed
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/groups"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Groups
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/events"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Events
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Profile
          </NavLink>
        </li>
        <li className="nav-item search-container">
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="searchbutton" onClick={handleSearch}>
            Search
          </button>
        </li>
      </ul>
      <button className="logout-button" onClick={logout}>
        Log Out
      </button>
    </nav>
  );
}
