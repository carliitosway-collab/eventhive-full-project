import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/auth.context";

import {
  FiHome,
  FiSearch,
  FiPlusSquare,
  FiHeart,
  FiUser,
} from "react-icons/fi";

export default function MobileBottomNav() {
  const { isLoggedIn } = useContext(AuthContext);

  const linkClass = ({ isActive }) =>
    [
      "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition",
      isActive
        ? "text-primary"
        : "text-base-content/80 hover:text-base-content",
    ].join(" ");

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-base-100 border-t border-base-300 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
      <div className="max-w-6xl mx-auto px-2">
        <div className="h-16 flex items-center justify-between">
          {/* Home */}
          <NavLink to="/" className={linkClass} aria-label="Home" end>
            <FiHome size={20} />
            <span className="text-[11px] font-medium">Home</span>
          </NavLink>

          {/* Explore */}
          <NavLink
            to="/events"
            className={linkClass}
            aria-label="Explore events"
            end
          >
            <FiSearch size={20} />
            <span className="text-[11px] font-medium">Explore</span>
          </NavLink>

          {/* Create / Login (CTA destacado) */}
          <NavLink
            to={isLoggedIn ? "/events/new" : "/login"}
            className={() =>
              [
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition",
                "text-primary",
                "bg-primary/10 hover:bg-primary/20",
              ].join(" ")
            }
            aria-label={isLoggedIn ? "Create event" : "Login"}
            end
          >
            <FiPlusSquare size={22} />
            <span className="text-[11px] font-semibold">
              {isLoggedIn ? "Create" : "Login"}
            </span>
          </NavLink>

          {/* Favorites */}
          <NavLink
            to={isLoggedIn ? "/favorites" : "/login"}
            className={linkClass}
            aria-label="Favorites"
            end
          >
            <FiHeart size={20} />
            <span className="text-[11px] font-medium">Saved</span>
          </NavLink>

          {/* Profile / Me */}
          <NavLink
            to={isLoggedIn ? "/me" : "/signup"}
            className={linkClass}
            aria-label="Profile"
            end
          >
            <FiUser size={20} />
            <span className="text-[11px] font-medium">
              {isLoggedIn ? "Me" : "Signup"}
            </span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
