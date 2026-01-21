import { Link, NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/auth.context";
import { LangContext } from "../context/lang.context";
import { FiUser, FiLogOut, FiLogIn, FiMenu, FiGlobe } from "react-icons/fi";

export default function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logOutUser } = useContext(AuthContext);
  const { toggleLang, t } = useContext(LangContext);

  const linkClass = ({ isActive }) =>
    `btn btn-ghost btn-sm ${isActive ? "btn-active" : ""}`;

  const mobileItemClass = ({ isActive }) =>
    `justify-start ${isActive ? "active font-semibold" : ""}`;

  const handleLogout = () => {
    logOutUser();
    navigate("/");
  };

  return (
    <div className="bg-base-100 border-b border-base-300">
      <div className="navbar max-w-6xl mx-auto px-4">
        {/* LEFT */}
        <div className="navbar-start">
          <Link
            to="/"
            className="btn btn-ghost text-lg font-black tracking-tight"
          >
            EventHive
          </Link>
        </div>

        {/* CENTER – Desktop */}
        <div className="navbar-center hidden md:flex">
          <ul className="menu menu-horizontal px-1 gap-1">
            <li>
              <NavLink to="/" className={linkClass}>
                {t.navHome}
              </NavLink>
            </li>
            <li>
              <NavLink to="/events" className={linkClass}>
                {t.navEvents}
              </NavLink>
            </li>
          </ul>
        </div>

        {/* RIGHT */}
        <div className="navbar-end gap-2">
          {/* Language toggle (desktop only) */}
          <button
            type="button"
            onClick={toggleLang}
            className="btn btn-ghost btn-sm border border-base-300 gap-2 hidden md:inline-flex"
            title={t.toggleLanguage}
            aria-label={t.toggleLanguage}
          >
            <FiGlobe />
            {t.langLabel}
          </button>

          {isLoggedIn ? (
            <>
              {/* User -> Profile */}
              <NavLink
                to="/profile"
                className="hidden sm:inline-flex items-center gap-2 opacity-80 hover:opacity-100 transition"
                title={t?.meTitle || "My profile"}
              >
                <FiUser />
                <span className="font-semibold">{user?.name || "User"}</span>
              </NavLink>

              {/* Logout (desktop) */}
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline btn-sm gap-2 hidden md:inline-flex"
              >
                <FiLogOut />
                {t.logout}
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/signup"
                className="btn btn-ghost btn-sm hidden md:inline-flex"
              >
                {t.signup}
              </NavLink>

              <NavLink
                to="/login"
                className="
                  btn btn-sm gap-2 font-semibold hidden md:inline-flex
                  bg-primary text-primary-content
                  shadow-md hover:shadow-lg
                  hover:bg-primary-focus
                  transition
                  active:scale-[0.98]
                "
              >
                <FiLogIn />
                {t.login}
              </NavLink>
            </>
          )}

          {/* Mobile dropdown */}
          <div className="dropdown dropdown-end md:hidden">
            <button
              type="button"
              tabIndex={0}
              className="btn btn-ghost btn-sm gap-2"
              aria-label="Open menu"
            >
              <FiMenu />
              {t.menu}
            </button>

            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow-lg bg-base-100 border border-base-300 rounded-box w-60 mt-2"
            >
              {/* User block (mobile) */}
              {isLoggedIn && (
                <>
                  <li className="menu-title">
                    <span className="flex items-center gap-2">
                      <FiUser />
                      {user?.name || "User"}
                    </span>
                  </li>

                  <li>
                    <NavLink to="/profile" className={mobileItemClass}>
                      {t?.meTitle || "My profile"}
                    </NavLink>
                  </li>
                </>
              )}

              <li>
                <NavLink to="/" className={mobileItemClass}>
                  {t.navHome}
                </NavLink>
              </li>
              <li>
                <NavLink to="/events" className={mobileItemClass}>
                  {t.navEvents}
                </NavLink>
              </li>

              {isLoggedIn ? (
                <li className="mt-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn btn-outline btn-sm gap-2 w-full justify-start"
                  >
                    <FiLogOut />
                    {t.logout}
                  </button>
                </li>
              ) : (
                <>
                  <li>
                    <NavLink to="/signup" className={mobileItemClass}>
                      {t.signup}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/login" className={mobileItemClass}>
                      {t.login}
                    </NavLink>
                  </li>
                </>
              )}

              {/* Language toggle (mobile) */}
              <li className="mt-2">
                <button
                  type="button"
                  onClick={toggleLang}
                  className="btn btn-ghost btn-sm border border-base-300 gap-2 w-full justify-start"
                >
                  <FiGlobe />
                  {t.langLabel}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
