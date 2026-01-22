import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FiChevronDown,
  FiUser,
  FiCalendar,
  FiHeart,
  FiPlus,
  FiLogOut,
} from "react-icons/fi";

// ✅ Trigger (pastilla igual que navbar)
const PILL_BTN =
  "inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 h-8 text-sm font-semibold text-indigo-800 shadow-sm hover:bg-indigo-100 transition active:scale-[0.98]";

// ✅ Items compactos y consistentes
const ITEM_CLASS = ({ isActive }) =>
  `w-full text-left inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition
   ${
     isActive
       ? "bg-indigo-100 text-indigo-900 font-semibold"
       : "hover:bg-indigo-100/70"
   }`;

export default function UserMenu({ username = "User", t, onLogout }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const close = () => setOpen(false);

  return (
    <div className="relative hidden md:block" ref={rootRef}>
      <button
        type="button"
        className={PILL_BTN}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={t?.meTitle || "My profile"}
      >
        <FiUser className="opacity-80" />
        <span className="max-w-[110px] truncate">{username}</span>
        <FiChevronDown className={`transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-2xl border border-indigo-200 bg-indigo-50 shadow-lg z-50 overflow-hidden"
          role="menu"
        >
          {/* Header más compacto y con el mismo tono */}
          <div className="px-4 py-2 border-b border-indigo-200">
            <p className="text-[11px] leading-4 text-indigo-700/70">
              Signed in as
            </p>
            <p className="text-sm font-bold leading-5 text-indigo-900 truncate">
              {username}
            </p>
          </div>

          <div className="p-2 bg-indigo-50">
            <NavLink to="/profile" className={ITEM_CLASS} onClick={close}>
              <FiUser />
              {t?.meTitle || "My profile"}
            </NavLink>

            <NavLink to="/my-events" className={ITEM_CLASS} onClick={close}>
              <FiCalendar />
              My events
            </NavLink>

            <NavLink to="/attending" className={ITEM_CLASS} onClick={close}>
              <FiUser />
              Attending
            </NavLink>

            <NavLink to="/favorites" className={ITEM_CLASS} onClick={close}>
              <FiHeart />
              Favorites
            </NavLink>

            <NavLink to="/events/new" className={ITEM_CLASS} onClick={close}>
              <FiPlus />
              New event
            </NavLink>
          </div>

          <div className="p-2 border-t border-indigo-200 bg-base-100">
            <button
              type="button"
              className="w-full text-left inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-indigo-50 text-error"
              onClick={() => {
                close();
                onLogout?.();
              }}
            >
              <FiLogOut />
              {t?.logout || "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
