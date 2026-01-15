import { useNavigate } from "react-router-dom";

export default function EventCard({ event }) {
  const navigate = useNavigate();

  const dateText = event?.date
    ? new Date(event.date).toLocaleString()
    : "Sin fecha";

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
      style={styles.card}
    >
      <div style={styles.topRow}>
        <h3 style={styles.title}>{event.title}</h3>
        <span style={styles.badge}>{event.isPublic ? "Public" : "Private"}</span>
      </div>

      <p style={styles.desc}>{event.description || "Sin descripción"}</p>

      <div style={styles.metaRow}>
        <span style={styles.metaItem}>
          📍 {event.location || "Sin ubicación"}
        </span>
        <span style={styles.metaItem}>🗓️ {dateText}</span>
      </div>

      <div style={styles.hint}>Ver detalles →</div>
    </article>
  );
}

const styles = {
  card: {
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    padding: 16,
    background: "white",
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
    cursor: "pointer",
    userSelect: "none",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
  },
  title: {
    margin: 0,
    fontSize: 18,
  },
  badge: {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.12)",
    opacity: 0.85,
    whiteSpace: "nowrap",
  },
  desc: {
    margin: "8px 0 12px",
    opacity: 0.8,
    lineHeight: 1.35,
  },
  metaRow: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    opacity: 0.85,
    fontSize: 14,
  },
  metaItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  hint: {
    marginTop: 12,
    fontSize: 13,
    opacity: 0.6,
  },
};
