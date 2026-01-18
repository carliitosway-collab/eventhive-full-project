import { Link, NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/auth.context";
import { LangContext } from "../context/lang.context";
import { FiUser, FiLogOut, FiLogIn, FiMenu, FiGlobe } from "react-icons/fi";

export default function Navbar() {
  const { isLoggedIn, user, logOutUser } = useContext(AuthContext);
  const { toggleLang, t } = useContext(LangContext);

  const linkClass = ({ isActive }) =>
    `btn btn-ghost btn-sm ${isActive ? "btn-active" : ""}`;

  const mobileItemClass = ({ isActive }) =>
    `justify-start ${isActive ? "active font-semibold" : ""}`;

  return (
    <div className="bg-base-100 border-b border-base-300">
      <div className="navbar max-w-6xl mx-auto px-4">
        {/* LEFT */}
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-lg font-black tracking-tight">
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

            {isLoggedIn && (
              <>
                <li>
                  <NavLink to="/my-events" className={linkClass}>
                    {t.navMyEvents}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/attending" className={linkClass}>
                    {t.navAttending}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/favorites" className={linkClass}>
                    {t.navFavorites}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/events/new" className={linkClass}>
                    {t.navNewEvent}
                  </NavLink>
                </li>
              </>
            )}
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
              <div className="hidden sm:flex items-center gap-2 opacity-80">
                <FiUser />
                <span className="font-semibold">{user?.name || "User"}</span>
              </div>

              {/* Logout (desktop) */}
              <button
                type="button"
                onClick={logOutUser}
                className="btn btn-outline btn-sm gap-2 hidden md:inline-flex"
              >
                <FiLogOut />
                {t.logout}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/signup" className="btn btn-ghost btn-sm hidden md:inline-flex">
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
                <li className="menu-title">
                  <span className="flex items-center gap-2">
                    <FiUser />
                    {user?.name || "User"}
                  </span>
                </li>
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
                <>
                  <li>
                    <NavLink to="/my-events" className={mobileItemClass}>
                      {t.navMyEvents}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/attending" className={mobileItemClass}>
                      {t.navAttending}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/favorites" className={mobileItemClass}>
                      {t.navFavorites}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/events/new" className={mobileItemClass}>
                      {t.navNewEvent}
                    </NavLink>
                  </li>

                  <li className="mt-2">
                    <button
                      type="button"
                      onClick={logOutUser}
                      className="btn btn-outline btn-sm gap-2 w-full justify-start"
                    >
                      <FiLogOut />
                      {t.logout}
                    </button>
                  </li>
                </>
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
