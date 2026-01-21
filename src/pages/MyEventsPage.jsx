import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiLoader,
  FiAlertTriangle,
  FiPlus,
  FiX,
  FiCalendar,
  FiMapPin,
  FiLock,
  FiGlobe,
  FiTag,
  FiMoreVertical,
  FiEye,
} from "react-icons/fi";

import eventsService from "../services/events.service";
import { getNiceHttpError } from "../utils/httpErrors";
import PageLayout from "../layouts/PageLayout";

function IconText({ icon: Icon, children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Icon />
      {children}
    </span>
  );
}

function toNiceDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function getEventPlace(ev) {
  const city = typeof ev?.city === "string" ? ev.city.trim() : "";
  const location = typeof ev?.location === "string" ? ev.location.trim() : "";
  return city || location || "No location";
}

function getSafeCategory(ev) {
  const c = typeof ev?.category === "string" ? ev.category.trim() : "";
  return c || "Other";
}

function isPastEvent(dateValue) {
  if (!dateValue) return false;
  const t = new Date(dateValue).getTime();
  return Number.isNaN(t) ? false : t < Date.now();
}

function sortByDateAsc(a, b) {
  return new Date(a?.date).getTime() - new Date(b?.date).getTime();
}

/* ✅ Your global pill pattern */
const PILL_STATIC =
  "inline-flex items-center gap-2 rounded-full border border-base-300 px-4 py-1.5 text-sm font-medium shadow-sm";
const PILL_BTN =
  "inline-flex items-center gap-2 rounded-full border border-base-300 px-4 py-1.5 text-sm font-medium shadow-sm hover:bg-base-200 transition active:scale-[0.98]";

export default function MyEventsPage() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [toast, setToast] = useState("");

  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);

  const eventsCountLabel = useMemo(() => {
    const n = events.length;
    return `${n} ${n === 1 ? "event" : "events"}`;
  }, [events.length]);

  const fetchMyEvents = (mode = "initial") => {
    if (mode === "refresh") setIsRefreshing(true);
    else setIsLoading(true);

    setError("");

    eventsService
      .getMyEvents()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setEvents(data);
      })
      .catch((err) => {
        setError(getNiceHttpError(err, "Could not load your events."));
      })
      .finally(() => {
        if (mode === "refresh") setIsRefreshing(false);
        else setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchMyEvents("initial");
  }, []);

  const openDeleteModal = (ev) => {
    setError("");
    setEventToDelete(ev);
    const el = document.getElementById("delete_event_modal");
    if (el && typeof el.showModal === "function") el.showModal();
  };

  const closeDeleteModal = () => {
    setEventToDelete(null);
    const el = document.getElementById("delete_event_modal");
    if (el && typeof el.close === "function") el.close();
  };

  const confirmDelete = () => {
    if (!eventToDelete?._id) return;

    const eventId = eventToDelete._id;

    setIsDeletingId(eventId);

    const previous = events;
    setEvents((prev) => prev.filter((ev) => ev._id !== eventId));

    eventsService
      .deleteEvent(eventId)
      .then(() => {
        closeDeleteModal();
        setToast("Event deleted");
        window.clearTimeout(window.__ehToastTimer);
        window.__ehToastTimer = window.setTimeout(() => setToast(""), 2200);
      })
      .catch((err) => {
        setEvents(previous);
        setError(getNiceHttpError(err, "Could not delete the event."));
      })
      .finally(() => setIsDeletingId(null));
  };

  return (
    <PageLayout>
      {toast ? (
        <div className="toast toast-end z-50">
          <div className="alert alert-success shadow-lg">
            <span>{toast}</span>
          </div>
        </div>
      ) : null}

      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <Link to="/events" className={`btn btn-ghost btn-sm gap-2 ${PILL_BTN}`}>
          <FiArrowLeft />
          Back
        </Link>

        {!isLoading && !error ? (
          <span className={PILL_STATIC}>
            <FiCalendar className="opacity-80" />
            {eventsCountLabel}
          </span>
        ) : null}
      </div>

      {/* Header */}
      <header className="mt-4 mb-6">
        <h1 className="text-4xl md:text-5xl font-black">My PRUEBA events</h1>
        <p className="opacity-70 mt-2">
          Manage the events you’ve created — edit, view or delete them.
        </p>
      </header>

      {/* Error banner */}
      {!isLoading && error ? (
        <div className="mb-4 space-y-3">
          <div className="alert alert-error">
            <IconText icon={FiAlertTriangle}>{error}</IconText>
          </div>

          <button
            type="button"
            onClick={() => fetchMyEvents("refresh")}
            className={PILL_BTN}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <FiLoader className="animate-spin" />
            ) : (
              <FiLoader className="opacity-80" />
            )}
            Retry
          </button>
        </div>
      ) : null}

      {/* Loading */}
      {isLoading ? (
        <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm">
          <div className="card-body">
            <p className="opacity-80 inline-flex items-center gap-2">
              <FiLoader className="animate-spin" />
              Loading your events…
            </p>
          </div>
        </div>
      ) : !error && events.length === 0 ? (
        /* Empty state */
        <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm">
          <div className="card-body">
            <div className="inline-flex items-center gap-2 opacity-70">
              <span className={PILL_STATIC}>
                <FiCalendar />
                Empty
              </span>
            </div>

            <h2 className="text-xl font-bold mt-3">No events yet</h2>
            <p className="opacity-75">
              Create your first event and start sharing it.
            </p>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => navigate("/events/new")}
                className={`${PILL_BTN} bg-base-100 hover:bg-base-200`}
              >
                <FiPlus className="text-base opacity-70" />
                <span>Create event</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* List */
        <div className="grid gap-4">
          {[...events].sort(sortByDateAsc).map((ev) => {
            const isDeletingThis = isDeletingId === ev._id;

            const niceDate = toNiceDate(ev?.date);
            const place = getEventPlace(ev);
            const category = getSafeCategory(ev);
            const isPublic = ev?.isPublic !== false;
            const imageUrl =
              typeof ev?.imageUrl === "string" ? ev.imageUrl.trim() : "";
            const isPast = isPastEvent(ev?.date);

            return (
              <div
                key={ev._id}
                className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm hover:shadow-md transition"
              >
                <div className="card-body p-4 md:p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-4 min-w-[240px] flex-1">
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-base-300 bg-base-200 shrink-0">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={ev?.title || "Event image"}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-60">
                            <FiGlobe className="text-2xl" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-[200px]">
                        <h3 className="text-lg font-bold m-0">
                          {ev?.title || "Untitled"}
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`badge badge-sm ${
                              isPublic ? "badge-success" : "badge-ghost"
                            } gap-2`}
                          >
                            {isPublic ? <FiGlobe /> : <FiLock />}
                            {isPublic ? "Public" : "Private"}
                          </span>

                          {isPast ? (
                            <span className="badge badge-sm badge-outline opacity-70">
                              Past
                            </span>
                          ) : null}

                          <span className="badge badge-sm badge-outline gap-2">
                            <FiTag />
                            {category}
                          </span>
                        </div>

                        <div className="mt-3 grid gap-1">
                          <p className="opacity-75 text-sm m-0 inline-flex items-center gap-2">
                            <FiCalendar />
                            {niceDate || "No date"}
                          </p>

                          <p className="opacity-75 text-sm m-0 inline-flex items-center gap-2">
                            <FiMapPin />
                            {place}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="dropdown dropdown-end group">
                        <button
                          type="button"
                          tabIndex={0}
                          className="btn btn-ghost btn-sm btn-square border border-base-300 transition group-focus-within:bg-base-200"
                          aria-label="Actions"
                          disabled={isDeletingThis}
                        >
                          <FiMoreVertical />
                        </button>

                        <ul
                          tabIndex={0}
                          className="dropdown-content menu bg-base-100 border border-base-300 rounded-xl shadow-lg w-44 p-2 origin-top-right transition-all duration-150 ease-out [transform:translateY(6px)_scale(.98)] opacity-0 group-focus-within:opacity-100 group-focus-within:[transform:translateY(0)_scale(1)]"
                        >
                          <li>
                            <Link
                              to={`/events/${ev._id}`}
                              onClick={() => document.activeElement?.blur()}
                              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left hover:bg-base-200 transition"
                            >
                              <FiEye />
                              <span>View</span>
                            </Link>
                          </li>

                          <li>
                            <Link
                              to={`/events/edit/${ev._id}`}
                              onClick={() => document.activeElement?.blur()}
                              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left hover:bg-base-200 transition"
                            >
                              <FiEdit2 />
                              <span>Edit</span>
                            </Link>
                          </li>

                          <li>
                            <button
                              type="button"
                              onClick={() => {
                                openDeleteModal(ev);
                                document.activeElement?.blur();
                              }}
                              disabled={isDeletingThis}
                              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left text-error hover:bg-error/10 transition"
                            >
                              <FiTrash2 />
                              <span>Delete</span>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Modal */}
      <dialog id="delete_event_modal" className="modal">
        <div className="modal-box relative w-11/12 max-w-lg p-5 md:p-6 rounded-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-black text-2xl">Delete event</h3>
              <p className="opacity-70 mt-1">This action cannot be undone.</p>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm btn-circle absolute right-4 top-4"
              onClick={closeDeleteModal}
              disabled={!!isDeletingId}
              aria-label="Close"
            >
              <FiX />
            </button>
          </div>

          <p className="mt-4 text-base leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="inline-flex items-center rounded-full bg-base-200 px-3 py-1 font-semibold align-middle">
              {eventToDelete?.title || "this event"}
            </span>
            ?
          </p>

          <div className="modal-action mt-6 flex justify-end gap-3">
            <button
              type="button"
              className={PILL_BTN}
              onClick={closeDeleteModal}
              disabled={!!isDeletingId}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-error rounded-full px-6 h-10 text-sm font-semibold shadow-md hover:shadow-lg active:scale-[0.97]"
              onClick={confirmDelete}
              disabled={!eventToDelete?._id || !!isDeletingId}
            >
              {!!isDeletingId ? (
                <FiLoader className="animate-spin" />
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </dialog>
    </PageLayout>
  );
}
