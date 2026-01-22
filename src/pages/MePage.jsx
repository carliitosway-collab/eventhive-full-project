import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiCalendar,
  FiCheckCircle,
  FiHeart,
  FiPlus,
  FiLogOut,
  FiGlobe,
  FiUser,
  FiChevronRight,
  FiLoader,
} from "react-icons/fi";

import PageLayout from "../layouts/PageLayout";
import { AuthContext } from "../context/auth.context";
import { LangContext } from "../context/lang.context";

import eventsService from "../services/events.service";
import favoritesService from "../services/favorites.service";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

/* EventHive pill system */
const PILL_STATIC =
  "inline-flex items-center gap-2 rounded-full border border-base-300 px-4 py-1.5 text-sm font-medium shadow-sm";
const PILL_BTN =
  "inline-flex items-center gap-2 rounded-full border border-base-300 px-4 py-1.5 text-sm font-medium shadow-sm hover:bg-base-200 transition active:scale-[0.98]";

const PILL_INDIGO_STATIC = `${PILL_STATIC} border-indigo-200 bg-indigo-50 text-indigo-700`;
const PILL_INDIGO_BTN = `${PILL_BTN} border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100`;

const ICON_PILL =
  "inline-flex items-center justify-center rounded-full h-9 w-9 border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm hover:bg-indigo-100 transition active:scale-[0.98]";

function RowLink({
  to,
  state,
  icon: Icon,
  title,
  subtitle,
  right,
  variant = "default",
}) {
  const isCTA = variant === "cta";

  return (
    <Link
      to={to}
      state={state}
      className={cx(
        "group flex items-center justify-between gap-4 rounded-2xl border-2 shadow-sm transition",
        "px-4 py-4",
        "active:scale-[0.99]",
        // EventHive indigo card look
        "border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50/60 hover:border-indigo-300 hover:shadow-md",
        isCTA ? "ring-1 ring-indigo-200/40" : "",
      )}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={cx(
            "w-10 h-10 rounded-xl flex items-center justify-center border border-indigo-200 transition shrink-0",
            "bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100",
          )}
        >
          <Icon className={cx("text-lg", isCTA ? "text-indigo-700" : "")} />
        </div>

        <div className="grid min-w-0">
          <div
            className={cx(
              "leading-tight truncate",
              isCTA ? "font-black" : "font-bold",
            )}
          >
            {title}
          </div>

          {subtitle ? (
            <div className="text-sm opacity-70 leading-tight mt-1 truncate">
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {right}
        {!isCTA && (
          <FiChevronRight className="opacity-60 transition group-hover:translate-x-0.5" />
        )}
      </div>
    </Link>
  );
}

function getArrayFromResponse(res) {
  const raw = res?.data;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.data?.data)) return raw.data.data;
  return [];
}

export default function MePage() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const fromMe = routerLocation.pathname + routerLocation.search;

  const { isLoggedIn, user, logOutUser } = useContext(AuthContext);
  const { toggleLang, t } = useContext(LangContext);

  const [counts, setCounts] = useState({
    myEvents: 0,
    attending: 0,
    favorites: 0,
  });
  const [isCountsLoading, setIsCountsLoading] = useState(true);

  if (!isLoggedIn) return null;

  const displayName = user?.name || "User";

  const openLogoutModal = () => {
    const el = document.getElementById("logout_modal");
    if (el && typeof el.showModal === "function") el.showModal();
  };

  const closeLogoutModal = () => {
    const el = document.getElementById("logout_modal");
    if (el && typeof el.close === "function") el.close();
  };

  const confirmLogout = () => {
    closeLogoutModal();
    logOutUser();
    navigate("/");
  };

  useEffect(() => {
    let isMounted = true;

    setIsCountsLoading(true);

    Promise.allSettled([
      eventsService.getMyEvents(),
      eventsService.getAttendingEvents(),
      favoritesService.getMyFavorites(),
    ])
      .then((results) => {
        if (!isMounted) return;

        const [myRes, attendingRes, favRes] = results;

        const myEventsArr =
          myRes.status === "fulfilled" ? getArrayFromResponse(myRes.value) : [];

        const attendingArr =
          attendingRes.status === "fulfilled"
            ? getArrayFromResponse(attendingRes.value)
            : [];

        const favoritesArr =
          favRes.status === "fulfilled"
            ? getArrayFromResponse(favRes.value)
            : [];

        setCounts({
          myEvents: myEventsArr.length,
          attending: attendingArr.length,
          favorites: favoritesArr.length,
        });
      })
      .finally(() => {
        if (!isMounted) return;
        setIsCountsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const Stat = ({ label, value }) => (
    <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/40 shadow-sm px-2 py-2">
      <div className="text-[11px] text-indigo-900/60 leading-tight">
        {label}
      </div>

      <div className="mt-0.5 text-xl font-black leading-none text-indigo-900">
        {isCountsLoading ? (
          <span className="inline-flex items-center gap-1 opacity-70">
            <FiLoader className="animate-spin text-sm" />
          </span>
        ) : (
          value
        )}
      </div>
    </div>
  );

  const Badge = ({ value }) => (
    <span className={cx(PILL_INDIGO_STATIC, "px-3 py-1 text-xs shadow-none")}>
      {isCountsLoading ? (
        <span className="inline-flex items-center gap-2">
          <FiLoader className="animate-spin" />
        </span>
      ) : (
        value
      )}
    </span>
  );

  const total = useMemo(() => {
    return counts.myEvents + counts.attending + counts.favorites;
  }, [counts]);

  return (
    <PageLayout>
      <div className="max-w-lg mx-auto">
        <header className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50/60 border-2 border-indigo-200 flex items-center justify-center text-indigo-700">
                <FiUser className="text-xl" />
              </div>

              <div className="grid">
                <h1 className="text-3xl md:text-4xl font-black leading-tight">
                  {t?.meTitle || "Me"}
                </h1>
                <p className="text-indigo-900/70">{displayName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleLang}
                className={ICON_PILL}
                title={t?.toggleLanguage || "Change language"}
                aria-label={t?.toggleLanguage || "Change language"}
              >
                <FiGlobe />
              </button>

              <button
                type="button"
                onClick={openLogoutModal}
                className={cx(
                  ICON_PILL,
                  "border-error/30 bg-base-100 text-error hover:bg-error/10",
                )}
                title={t?.logout || "Logout"}
                aria-label={t?.logout || "Logout"}
              >
                <FiLogOut />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat
              label={t?.navMyEvents || "My events"}
              value={counts.myEvents}
            />
            <Stat
              label={t?.navAttending || "Attending"}
              value={counts.attending}
            />
            <Stat
              label={t?.navFavorites || "Favorites"}
              value={counts.favorites}
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-indigo-900/60">
              {isCountsLoading ? "Loading stats…" : "Overview"}
            </div>

            <span className={cx(PILL_INDIGO_STATIC, "px-3 py-1 text-xs")}>
              {isCountsLoading ? "…" : `Total: ${total}`}
            </span>
          </div>
        </header>

        <div className="grid gap-3">
          <RowLink
            to="/my-events"
            state={{ from: fromMe }}
            icon={FiCalendar}
            title={t?.navMyEvents || "My events"}
            subtitle="Events you created"
            right={<Badge value={counts.myEvents} />}
          />

          <RowLink
            to="/attending"
            state={{ from: fromMe }}
            icon={FiCheckCircle}
            title={t?.navAttending || "Attending"}
            subtitle="Events you joined"
            right={<Badge value={counts.attending} />}
          />

          <RowLink
            to="/favorites"
            state={{ from: fromMe }}
            icon={FiHeart}
            title={t?.navFavorites || "Favorites"}
            subtitle="Saved events"
            right={<Badge value={counts.favorites} />}
          />

          <RowLink
            to="/events/new"
            state={{ from: fromMe }}
            icon={FiPlus}
            title={t?.navNewEvent || "New event"}
            subtitle="Create a public or private event"
            variant="cta"
            right={
              <span className={cx(PILL_INDIGO_BTN, "px-3 py-1 text-xs")}>
                {t?.create || "Create"}
              </span>
            }
          />
        </div>

        <dialog id="logout_modal" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{t?.logout || "Logout"}</h3>
            <p className="py-4 opacity-80">
              {t?.logoutConfirm ||
                "Are you sure you want to log out? You’ll need to log in again."}
            </p>

            <div className="modal-action">
              <button
                type="button"
                className={PILL_INDIGO_BTN}
                onClick={closeLogoutModal}
              >
                {t?.cancel || "Cancel"}
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-error/30 bg-base-100 px-4 py-1.5 text-sm font-semibold text-error shadow-sm transition hover:bg-error/10 active:scale-[0.98]"
                onClick={confirmLogout}
              >
                {t?.logout || "Logout"}
              </button>
            </div>
          </div>

          <form method="dialog" className="modal-backdrop">
            <button type="submit">close</button>
          </form>
        </dialog>
      </div>
    </PageLayout>
  );
}
