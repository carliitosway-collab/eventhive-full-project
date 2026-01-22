import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiHeart,
  FiMessageCircle,
  FiUsers,
  FiArrowRight,
  FiLoader,
  FiAlertTriangle,
  FiPlus,
  FiLogIn,
  FiRefreshCcw,
} from "react-icons/fi";

import { AuthContext } from "../context/auth.context";
import eventsService from "../services/events.service";
import EventCard from "../components/EventCard";
import PageLayout from "../layouts/PageLayout";

function IconText({ icon: Icon, children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Icon />
      {children}
    </span>
  );
}

function getNiceError(err) {
  if (!err?.response) return "No connection or the server is not responding.";
  return err?.response?.data?.message || "Something went wrong.";
}

function getArrayFromResponse(res) {
  const raw = res?.data;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.data?.data)) return raw.data.data;
  return [];
}

function FeaturePill({ icon: Icon, label }) {
  return (
    <span className="badge badge-outline gap-2 py-3">
      <Icon className="opacity-80" />
      <span className="text-sm font-semibold">{label}</span>
    </span>
  );
}

/* Pill pattern (aligned with EventHive pills) */
const PILL_BTN =
  "inline-flex items-center gap-2 rounded-full border border-base-300 px-4 py-1.5 text-sm font-medium shadow-sm hover:bg-base-200 transition active:scale-[0.98]";

const PILL_INDIGO_BTN = `${PILL_BTN} border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100`;

export default function HomePage() {
  const { isLoggedIn } = useContext(AuthContext);

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUpcoming = () => {
    setIsLoading(true);
    setError("");

    eventsService
      .getPublicEvents({ page: 1, limit: 3, sort: "date" })
      .then((res) => {
        const list = getArrayFromResponse(res);
        setEvents(list);
      })
      .catch((err) => {
        console.log(err);
        setError(getNiceError(err));
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchUpcoming();
  }, []);

  // Extra safety: keep only upcoming by date (frontend guard)
  const upcoming = useMemo(() => {
    const now = new Date();
    return [...events]
      .filter((ev) => (ev?.date ? new Date(ev.date) >= now : true))
      .slice(0, 3);
  }, [events]);

  return (
    <PageLayout>
      {/* HERO */}
      <section className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 md:p-8">
          {/* Left */}
          <div className="flex flex-col gap-4">
            <p className="text-sm font-bold opacity-70 tracking-wide">
              EventHive
            </p>

            <h1 className="text-4xl md:text-5xl font-black leading-tight">
              Discover events and join in one click
            </h1>

            <p className="text-base opacity-80 max-w-xl">
              Public events, favorites, attendance, and comments — all in one
              place. Simple and fast.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/events"
                className="btn btn-primary gap-2 shadow-md hover:shadow-lg transition active:scale-[0.98]"
              >
                <FiArrowRight />
                Browse events
              </Link>

              {isLoggedIn ? (
                <Link to="/events/new" className="btn btn-outline gap-2">
                  <FiPlus />
                  Create event
                </Link>
              ) : (
                <Link to="/signup" className="btn btn-outline gap-2">
                  <FiLogIn />
                  Create account
                </Link>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <FeaturePill icon={FiUsers} label="Attend" />
              <FeaturePill icon={FiHeart} label="Favorites" />
              <FeaturePill icon={FiMessageCircle} label="Comments" />
              <FeaturePill icon={FiCalendar} label="Upcoming" />
            </div>
          </div>

          {/* Right card */}
          <div className="flex">
            <div className="card w-full bg-base-100 border border-base-300 rounded-2xl">
              <div className="card-body gap-3">
                <h2 className="card-title text-xl">Quick tip</h2>
                <p className="opacity-80">
                  Save events to your favorites so you can find them instantly
                  later.
                </p>

                <div className="card-actions justify-start pt-1">
                  <Link
                    to={isLoggedIn ? "/favorites" : "/signup"}
                    className="btn btn-ghost gap-2"
                  >
                    <FiHeart />
                    Go to favorites
                  </Link>
                </div>

                <div className="mt-2 pt-3 border-t border-base-300 text-sm opacity-70">
                  Pro move: use the Events page to search and load more.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mt-8 card bg-base-100 border border-base-300 rounded-2xl shadow-sm">
        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-extrabold">How it works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="card bg-base-100 border border-base-300 rounded-xl">
              <div className="card-body">
                <h3 className="card-title">1. Explore events</h3>
                <p className="opacity-80">
                  Discover public events and open details to see date, location,
                  and attendees.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 border border-base-300 rounded-xl">
              <div className="card-body">
                <h3 className="card-title">2. Interact</h3>
                <p className="opacity-80">
                  Join events, save favorites, and participate in the comments.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 border border-base-300 rounded-xl">
              <div className="card-body">
                <h3 className="card-title">3. Stay organized</h3>
                <p className="opacity-80">
                  Access your favorites anytime or create your own events.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UPCOMING PREVIEW */}
      <section className="mt-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-extrabold">Upcoming events</h2>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchUpcoming}
              className={PILL_INDIGO_BTN}
              disabled={isLoading}
              aria-label="Refresh"
              title="Refresh"
            >
              <FiRefreshCcw />
              Refresh
            </button>

            <Link to="/events" className="link link-hover font-semibold">
              <IconText icon={FiArrowRight}>See all</IconText>
            </Link>
          </div>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <p className="opacity-75">
              <IconText icon={FiLoader}>Loading events…</IconText>
            </p>
          ) : error ? (
            <div className="alert alert-error">
              <IconText icon={FiAlertTriangle}>{error}</IconText>

              <button
                type="button"
                onClick={fetchUpcoming}
                className={PILL_BTN}
              >
                <FiRefreshCcw />
                Retry
              </button>
            </div>
          ) : upcoming.length === 0 ? (
            <div className="card bg-base-100 border border-base-300 rounded-2xl">
              <div className="card-body">
                <p className="opacity-75">No upcoming events yet.</p>
                <div className="card-actions">
                  <Link to="/events" className="btn btn-primary gap-2">
                    <FiArrowRight />
                    Browse events
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcoming.map((ev) => (
                <EventCard key={ev._id} event={ev} />
              ))}
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
