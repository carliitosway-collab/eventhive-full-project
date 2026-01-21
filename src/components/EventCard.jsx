import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiCalendar,
  FiArrowRight,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";

import { LangContext } from "../context/lang.context";

function extractObjectId(value) {
  const s = String(value || "");
  const match = s.match(/[a-fA-F0-9]{24}/);
  return match ? match[0] : "";
}

function formatEventDate(dateIso, lang) {
  if (!dateIso) return "";

  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return "";

  const locale = lang === "es" ? "es-ES" : "en-GB";

  const parts = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(d);

  const get = (type) => parts.find((p) => p.type === type)?.value || "";

  return `${get("day")}/${get("month")}/${get("year")} · ${get("hour")}:${get(
    "minute",
  )}`;
}

export default function EventCard({
  event,
  isFavorited = false,
  isTogglingFavorite = false,
  onToggleFavorite,
  onShare,
  onRemove,
  showActions = true, // ✅ NEW
}) {
  const navigate = useNavigate();
  const { lang, t } = useContext(LangContext);

  const safeId = useMemo(() => {
    return extractObjectId(event?._id || event?.id || event?.eventId);
  }, [event?._id, event?.id, event?.eventId]);

  const dateText = useMemo(() => {
    const formatted = formatEventDate(event?.date, lang);
    return formatted || t?.noDate || "No date";
  }, [event?.date, lang, t]);

  const goToDetail = () => {
    if (!safeId) return;
    navigate(`/events/${safeId}`);
  };

  const isPrivate = event?.isPublic === false;

  const PILL_BTN =
    "inline-flex items-center gap-2 rounded-full border border-base-300 px-4 py-1.5 text-sm font-medium shadow-sm hover:bg-base-200 transition active:scale-[0.98]";

  return (
    <article
      onClick={goToDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") goToDetail();
      }}
      className="
        card bg-base-100 border border-base-300 rounded-2xl
        shadow-sm hover:shadow-md transition-all duration-200
        cursor-pointer hover:-translate-y-[1px]
      "
    >
      <div className="card-body gap-3 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className="card-title text-base md:text-lg font-semibold line-clamp-2">
            {event?.title || "Untitled"}
          </h3>

          {showActions && (
            <div className="flex items-center gap-2 shrink-0">
              {!!onToggleFavorite && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!safeId) return;
                    onToggleFavorite?.(safeId);
                  }}
                  className={PILL_BTN}
                  disabled={isTogglingFavorite || !safeId}
                  aria-label={
                    isFavorited ? "Remove from favorites" : "Save to favorites"
                  }
                  title={
                    isFavorited ? "Remove from favorites" : "Save to favorites"
                  }
                >
                  {isTogglingFavorite ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : isFavorited ? (
                    <BsBookmarkFill className="text-amber-500" />
                  ) : (
                    <BsBookmark />
                  )}
                </button>
              )}

              {!!onShare && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!safeId) return;
                    onShare?.({ ...event, _id: safeId });
                  }}
                  className={PILL_BTN}
                  disabled={!safeId}
                  aria-label="Share"
                  title="Share"
                >
                  <FiUpload />
                </button>
              )}

              {onRemove && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!safeId) return;
                    onRemove(safeId);
                  }}
                  className={PILL_BTN}
                  aria-label="Remove from favorites"
                  title="Remove from favorites"
                  disabled={!safeId}
                >
                  <FiX />
                </button>
              )}

              {isPrivate && (
                <span className="badge badge-neutral badge-outline">
                  {t?.private || "Private"}
                </span>
              )}
            </div>
          )}
        </div>

        <p className="opacity-80 line-clamp-2 min-h-[3rem]">
          {event?.description || t?.noDesc || "No description"}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-sm opacity-90">
          <span className="inline-flex items-center gap-2">
            <FiMapPin />
            {event?.location || t?.noLocation || "No location"}
          </span>
          <span className="inline-flex items-center gap-2">
            <FiCalendar />
            {dateText}
          </span>
        </div>

        <div className="group mt-auto pt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          <span>{t?.viewDetails || "View details"}</span>
          <FiArrowRight className="group-hover:translate-x-0.5 transition" />
        </div>
      </div>
    </article>
  );
}
