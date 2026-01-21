import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

function RowLink({ to, icon: Icon, title, subtitle, right }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-base-300 bg-base-100 shadow-sm hover:shadow-md transition"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center">
          <Icon className="text-lg" />
        </div>

        <div className="grid">
          <div className="font-bold leading-tight">{title}</div>
          {subtitle ? (
            <div className="text-sm opacity-70 leading-tight mt-1">
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {right}
        <FiChevronRight className="opacity-60" />
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
      favoritesService.getMyFavorites(), // ✅ FIX: tu método real
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
    <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-4">
      <div className="text-sm opacity-70">{label}</div>
      <div className="mt-1 text-2xl font-black leading-none">
        {isCountsLoading ? (
          <span className="inline-flex items-center gap-2 opacity-70">
            <FiLoader className="animate-spin" />
          </span>
        ) : (
          value
        )}
      </div>
    </div>
  );

  const Badge = ({ value }) => (
    <span className="badge badge-ghost">
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
      <header className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-base-100 border border-base-300 flex items-center justify-center">
              <FiUser className="text-xl" />
            </div>

            <div className="grid">
              <h1 className="text-3xl md:text-4xl font-black leading-tight">
                {t?.meTitle || "Me"}
              </h1>
              <p className="opacity-70">{displayName}</p>
            </div>
          </div>

          {/* Top-right actions (icon-only) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLang}
              className="btn btn-ghost btn-sm btn-square border border-base-300"
              title={t?.toggleLanguage || "Change language"}
              aria-label={t?.toggleLanguage || "Change language"}
            >
              <FiGlobe />
            </button>

            <button
              type="button"
              onClick={openLogoutModal}
              className="btn btn-ghost btn-sm btn-square border border-base-300 text-error"
              title={t?.logout || "Logout"}
              aria-label={t?.logout || "Logout"}
            >
              <FiLogOut />
            </button>
          </div>
        </div>

        {/* Mini stats */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat label={t?.navMyEvents || "My events"} value={counts.myEvents} />
          <Stat
            label={t?.navAttending || "Attending"}
            value={counts.attending}
          />
          <Stat
            label={t?.navFavorites || "Favorites"}
            value={counts.favorites}
          />
        </div>

        <div className="mt-3 text-sm opacity-70">
          {isCountsLoading ? "Loading stats…" : `Total: ${total}`}
        </div>
      </header>

      <div className="grid gap-3">
        <RowLink
          to="/my-events"
          icon={FiCalendar}
          title={t?.navMyEvents || "My events"}
          subtitle="Events you created"
          right={<Badge value={counts.myEvents} />}
        />

        <RowLink
          to="/attending"
          icon={FiCheckCircle}
          title={t?.navAttending || "Attending"}
          subtitle="Events you joined"
          right={<Badge value={counts.attending} />}
        />

        <RowLink
          to="/favorites"
          icon={FiHeart}
          title={t?.navFavorites || "Favorites"}
          subtitle="Saved events"
          right={<Badge value={counts.favorites} />}
        />

        <RowLink
          to="/events/new"
          icon={FiPlus}
          title={t?.navNewEvent || "New event"}
          subtitle="Create a public or private event"
        />
      </div>

      {/* Logout confirm (anti-misclick) */}
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
              className="btn btn-ghost"
              onClick={closeLogoutModal}
            >
              {t?.cancel || "Cancel"}
            </button>

            <button
              type="button"
              className="btn btn-error"
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
    </PageLayout>
  );
}
