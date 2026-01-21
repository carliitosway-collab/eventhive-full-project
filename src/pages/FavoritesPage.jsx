import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiLoader, FiAlertTriangle } from "react-icons/fi";

import favoritesService from "../services/favorites.service";
import EventCard from "../components/EventCard";
import PageLayout from "../layouts/PageLayout";

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

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [toast, setToast] = useState({
    show: false,
    message: "",
    variant: "success", // "success" | "info" | "error"
    actionLabel: "",
    actionHref: "",
  });

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

  const fetchFavorites = () => {
    setIsLoading(true);
    setError("");

    favoritesService
      .getMyFavorites()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setFavorites(data);
      })
      .catch(() => setError("Could not load favorites."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const sortedFavorites = useMemo(() => {
    return [...favorites].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [favorites]);

  const handleRemoveFavorite = (eventId) => {
    setError("");

    setFavorites((prev) => {
      const snapshot = prev;
      const next = prev.filter((ev) => ev._id !== eventId);

      favoritesService.removeFavorite(eventId).catch((err) => {
        console.log(err);
        setFavorites(snapshot);
        setError("Could not remove favorite.");
        showToast({ message: "Could not remove", variant: "error" });
      });

      return next;
    });

    showToast({ message: "Removed from favorites", variant: "success" });
  };

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
    } catch (err) {
      console.log(err);
      showToast({ message: "Could not share", variant: "error" });
    }
  };

  const PILL_BTN =
    "inline-flex items-center gap-2 rounded-full border border-base-300 px-4 py-1.5 text-sm font-medium shadow-sm hover:bg-base-200 transition active:scale-[0.98]";

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

      <div className="flex items-center justify-between gap-4">
        <Link to="/events" className={PILL_BTN}>
          <FiArrowLeft />
          Back
        </Link>
      </div>

      <header className="mt-4 mb-6">
        <h1 className="text-4xl font-black">Favorites</h1>

        {!isLoading && !error && (
          <p className="opacity-70 mt-2">
            {sortedFavorites.length} saved event
            {sortedFavorites.length !== 1 && "s"}
          </p>
        )}
      </header>

      {isLoading ? (
        <IconText icon={FiLoader}>Loading…</IconText>
      ) : error ? (
        <div className="alert alert-error">
          <IconText icon={FiAlertTriangle}>{error}</IconText>
        </div>
      ) : sortedFavorites.length === 0 ? (
        <p className="opacity-70">You don’t have any favorites yet.</p>
      ) : (
        <div className="grid gap-4">
          {sortedFavorites.map((ev) => (
            <EventCard
              key={ev._id}
              event={ev}
              isFavorited
              onToggleFavorite={handleRemoveFavorite}
              onShare={handleShare}
              onRemove={handleRemoveFavorite}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
