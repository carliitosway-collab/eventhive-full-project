import { useNavigate } from "react-router-dom";
import { FiMapPin, FiCalendar } from "react-icons/fi";

export default function EventCard({ event }) {
  const navigate = useNavigate();

  const dateText = event?.date ? new Date(event.date).toLocaleString() : "Sin fecha";

  const goToDetail = () => {
    navigate(`/events/${event._id}`);
  };

  return (
    <article
      onClick={goToDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") goToDetail();
      }}
      className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer"
    >
      <div className="card-body">
        <div className="flex items-start justify-between gap-3">
          <h3 className="card-title text-base md:text-lg">{event?.title || "Untitled"}</h3>

          <span className={`badge ${event?.isPublic ? "badge-outline" : "badge-neutral"}`}>
            {event?.isPublic ? "Public" : "Private"}
          </span>
        </div>

        <p className="opacity-80 line-clamp-3">
          {event?.description || "Sin descripción"}
        </p>

        <div className="flex flex-wrap gap-3 text-sm opacity-80">
          <span className="inline-flex items-center gap-2">
            <FiMapPin />
            {event?.location || "Sin ubicación"}
          </span>

          <span className="inline-flex items-center gap-2">
            <FiCalendar />
            {dateText}
          </span>
        </div>

        <div className="text-xs opacity-60 mt-2">Ver detalles →</div>
      </div>
    </article>
  );
}
