import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";

export default function NavBar() {
  return (
    <nav className="h-screen p-4">
      <div className="shape">
        <img src={logo} alt="Logo" className="logo-top-left" />
      </div>
      <ul className="navbuttons">
        <li className="nav-item">
          <NavLink
            to="/features/feed"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Feed
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/features/groups"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Groups
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/features/events"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Events
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/features/profile"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Profile
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
