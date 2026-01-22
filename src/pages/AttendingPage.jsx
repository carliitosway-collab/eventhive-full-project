import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiArrowLeft,
  FiLoader,
  FiAlertTriangle,
  FiRefreshCcw,
} from "react-icons/fi";

import eventsService from "../services/events.service";
import EventCard from "../components/EventCard";
import { getNiceHttpError } from "../utils/httpErrors";
import PageLayout from "../layouts/PageLayout";

const PILL_INFO =
  "inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-medium shadow-sm";

const PILL_BACK =
  "inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-medium shadow-sm hover:bg-indigo-100 transition active:scale-[0.98]";

const PILL_BTN =
  "inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-medium shadow-sm hover:bg-indigo-100 transition active:scale-[0.98]";

function IconText({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon />
      {children}
    </span>
  );
}

function isValidMongoId(value) {
  return /^[a-f\d]{24}$/i.test(String(value || ""));
}

// Seguridad básica: solo rutas internas (empiezan por "/") y nada de urls raras
function normalizeInternalPath(value) {
  const v = typeof value === "string" ? value.trim() : "";
  if (!v) return "";
  if (!v.startsWith("/")) return "";
  if (v.startsWith("//")) return "";
  return v;
}

export default function AttendingPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();

  const KEY = "eh:lastFrom:attending";

  const [toast, setToast] = useState({
    show: false,
    message: "",
    variant: "success", // "success" | "info" | "error"
    actionLabel: "",
    actionHref: "",
  });

  useEffect(() => {
    const incomingFrom = normalizeInternalPath(location.state?.from);
    if (incomingFrom) sessionStorage.setItem(KEY, incomingFrom);
  }, [location.state]);

  const backTo = useMemo(() => {
    const incomingFrom = normalizeInternalPath(location.state?.from);
    return incomingFrom || sessionStorage.getItem(KEY) || "/me";
  }, [location.state]);

  const showToast = ({
    message,
    variant = "success",
    actionLabel = "",
    actionHref = "",
  }) => {
    setToast({ show: true, message, variant, actionLabel, actionHref });

    window.setTimeout(() => {
      setToast({
        show: false,
        message: "",
        variant: "success",
        actionLabel: "",
        actionHref: "",
      });
    }, 2500);
  };

  const fetchAttending = () => {
    setIsLoading(true);
    setError("");

    eventsService
      .getAttendingEvents()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setEvents(data);
      })
      .catch((err) =>
        setError(getNiceHttpError(err, "Could not load attending.")),
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAttending();
  }, []);

  const handleShare = async (payload) => {
    const eventId =
      typeof payload === "string"
        ? payload
        : payload?._id || payload?.id || payload?.eventId;

    if (!isValidMongoId(eventId)) {
      showToast({ message: "Invalid link to share", variant: "error" });
      return;
    }

    const url = `${window.location.origin}/events/${eventId}`;
    const title =
      typeof payload === "object" ? payload?.title || "Event" : "Event";
    const text = typeof payload === "object" ? payload?.description || "" : "";

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        showToast({ message: "Ready to share", variant: "success" });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        showToast({ message: "Link copied", variant: "success" });
        return;
      }

      window.prompt("Copy link:", url);
      showToast({ message: "Link ready", variant: "success" });
    } catch (err) {
      console.log(err);
      showToast({ message: "Could not share", variant: "error" });
    }
  };

  return (
    <PageLayout>
      {toast.show && (
        <div className="toast toast-top toast-end z-50">
          <div
            className={`alert ${
              toast.variant === "error"
                ? "alert-error"
                : toast.variant === "info"
                  ? "alert-info"
                  : "alert-success"
            } shadow-lg px-4 py-2 text-sm rounded-full flex items-center gap-3`}
          >
            <span>{toast.message}</span>

            {toast.actionLabel && toast.actionHref && (
              <a
                href={toast.actionHref}
                className="btn btn-xs rounded-full"
                onClick={(e) => e.stopPropagation()}
              >
                {toast.actionLabel}
              </a>
            )}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <header className="mt-3 mb-6">
          <h1 className="text-4xl font-black">Attending</h1>

          <div className="mt-3 flex items-center justify-between gap-4">
            <Link to={backTo} className={PILL_BACK}>
              <FiArrowLeft />
              Back
            </Link>

            {!isLoading && !error && (
              <span className={PILL_INFO}>
                {events.length} event{events.length !== 1 && "s"}
              </span>
            )}
          </div>
        </header>

        {isLoading ? (
          <IconText icon={FiLoader}>Loading…</IconText>
        ) : error ? (
          <div className="space-y-3">
            <div className="alert alert-error">
              <IconText icon={FiAlertTriangle}>{error}</IconText>
            </div>

            <button type="button" onClick={fetchAttending} className={PILL_BTN}>
              <FiRefreshCcw />
              Retry
            </button>
          </div>
        ) : events.length === 0 ? (
          <p className="opacity-70">You’re not attending any events yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 items-stretch">
            {events.map((ev) => (
              <EventCard
                key={ev._id}
                event={ev}
                showActions
                onShare={handleShare}
                onToggleFavorite={null}
                isFavorited={false}
                isTogglingFavorite={false}
              />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
