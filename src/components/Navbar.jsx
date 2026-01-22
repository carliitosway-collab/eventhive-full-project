import { Link, NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/auth.context";
import { LangContext } from "../context/lang.context";
import { FiLogIn, FiMenu, FiGlobe, FiLogOut, FiUser } from "react-icons/fi";

import UserMenu from "../components/UserMenu";

export default function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logOutUser } = useContext(AuthContext);
  const { toggleLang, t } = useContext(LangContext);

  const linkClass = ({ isActive }) =>
    `inline-flex items-center rounded-full px-3 h-8 text-sm font-semibold transition border
   ${
     isActive
       ? "bg-indigo-100 border-indigo-300 text-indigo-800"
       : "bg-transparent border-transparent hover:bg-indigo-100/70 hover:border-indigo-300/70"
   }`;

  const mobileItemClass = ({ isActive }) =>
    `justify-start ${isActive ? "active font-semibold" : ""}`;

  const handleLogout = () => {
    logOutUser();
    navigate("/");
  };

  return (
    <div className="bg-indigo-100 border-b border-indigo-200 shadow-sm sticky top-0 z-50">
      <div className="navbar min-h-[48px] max-w-6xl mx-auto px-4 py-0.5">
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
          <div className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 shadow-sm">
            <NavLink to="/" className={linkClass}>
              {t.navHome}
            </NavLink>
            <NavLink to="/events" className={linkClass}>
              {t.navEvents}
            </NavLink>
          </div>
        </div>

        {/* RIGHT */}
        <div className="navbar-end gap-2">
          {/* Language toggle (desktop only) */}
          <button
            type="button"
            onClick={toggleLang}
            className="hidden md:inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 h-8 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition active:scale-[0.98]"
            title={t.toggleLanguage}
            aria-label={t.toggleLanguage}
          >
            <FiGlobe />
            {t.langLabel}
          </button>

          {isLoggedIn ? (
            <>
              {/* Desktop user dropdown */}
              <UserMenu
                username={user?.name || "User"}
                t={t}
                onLogout={handleLogout}
                className="hidden md:inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 h-8 text-sm font-semibold text-indigo-800 hover:bg-indigo-100 transition active:scale-[0.98]"
              />
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

                  {/* Extra links requested (mobile too) */}
                  <li>
                    <NavLink to="/my-events" className={mobileItemClass}>
                      My events
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/attending" className={mobileItemClass}>
                      Attending
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/favorites" className={mobileItemClass}>
                      Favorites
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/events/new" className={mobileItemClass}>
                      New event
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
