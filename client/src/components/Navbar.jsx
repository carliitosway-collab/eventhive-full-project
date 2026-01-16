import { Link, NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/auth.context";
import { FiUser, FiLogOut, FiLogIn } from "react-icons/fi";

export default function Navbar() {
  const { isLoggedIn, user, logOutUser } = useContext(AuthContext);

  const linkClass = ({ isActive }) =>
    `btn btn-ghost btn-sm ${isActive ? "btn-active" : ""}`;

  return (
    <div className="navbar bg-base-100 border-b border-base-300">
      <div className="navbar-start">
        {/* Brand */}
        <Link to="/" className="btn btn-ghost text-lg font-black">
          EventHive
        </Link>
      </div>

      <div className="navbar-center hidden md:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          <li>
            <NavLink to="/" className={linkClass}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/events" className={linkClass}>
              Events
            </NavLink>
          </li>

          {isLoggedIn && (
            <>
              <li>
                <NavLink to="/my-events" className={linkClass}>
                  My Events
                </NavLink>
              </li>
              <li>
                <NavLink to="/attending" className={linkClass}>
                  Attending
                </NavLink>
              </li>
              <li>
                <NavLink to="/favorites" className={linkClass}>
                  Favorites
                </NavLink>
              </li>
              <li>
                <NavLink to="/events/new" className={linkClass}>
                  New Event
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>

      <div className="navbar-end gap-2">
        {isLoggedIn ? (
          <>
            <div className="hidden sm:flex items-center gap-2 opacity-80">
              <FiUser />
              <span className="font-semibold">{user?.name || "User"}</span>
            </div>

            <button type="button" onClick={logOutUser} className="btn btn-outline btn-sm">
              <FiLogOut />
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/signup" className="btn btn-ghost btn-sm">
              Signup
            </NavLink>
            <NavLink to="/login" className="btn btn-primary btn-sm">
              <FiLogIn />
              Login
            </NavLink>
          </>
        )}

        {/* Mobile dropdown */}
        <div className="dropdown dropdown-end md:hidden">
          <label tabIndex={0} className="btn btn-ghost btn-sm">
            Menu
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 border border-base-300 rounded-box w-52"
          >
            <li><NavLink to="/" className={linkClass}>Home</NavLink></li>
            <li><NavLink to="/events" className={linkClass}>Events</NavLink></li>

            {isLoggedIn && (
              <>
                <li><NavLink to="/my-events" className={linkClass}>My Events</NavLink></li>
                <li><NavLink to="/attending" className={linkClass}>Attending</NavLink></li>
                <li><NavLink to="/favorites" className={linkClass}>Favorites</NavLink></li>
                <li><NavLink to="/events/new" className={linkClass}>New Event</NavLink></li>
              </>
            )}

            {!isLoggedIn && (
              <>
                <li><NavLink to="/signup" className={linkClass}>Signup</NavLink></li>
                <li><NavLink to="/login" className={linkClass}>Login</NavLink></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
