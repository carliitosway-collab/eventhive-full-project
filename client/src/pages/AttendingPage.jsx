import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiLoader, FiAlertTriangle } from "react-icons/fi";
import eventsService from "../services/events.service";
import EventCard from "../components/EventCard";
import { getNiceHttpError } from "../utils/httpErrors";

function IconText({ icon: Icon, children, style }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, ...style }}>
      <Icon />
      {children}
    </span>
  );
}

export default function AttendingPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAttending = () => {
    setIsLoading(true);
    setError("");

    eventsService
      .getAttendingEvents()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setEvents(data);
      })
      .catch((err) => {
        console.log(err);
        setError(getNiceHttpError(err, "No pude cargar tus eventos inscritos."));
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAttending();
  }, []);

  if (isLoading) {
    return (
      <div style={styles.page}>
        <Link to="/events" style={styles.backLink}>
          <IconText icon={FiArrowLeft}>Volver</IconText>
        </Link>

        <h1 style={styles.h1}>Attending</h1>

        <p style={styles.muted}>
          <IconText icon={FiLoader}>Cargando…</IconText>
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <Link to="/events" style={styles.backLink}>
          <IconText icon={FiArrowLeft}>Volver</IconText>
        </Link>

        <h1 style={styles.h1}>Attending</h1>

        <p style={styles.error}>
          <IconText icon={FiAlertTriangle}>{error}</IconText>
        </p>

        <button type="button" onClick={fetchAttending} style={styles.btn}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Link to="/events" style={styles.backLink}>
        <IconText icon={FiArrowLeft}>Volver</IconText>
      </Link>

      <header style={{ marginBottom: 14 }}>
        <h1 style={styles.h1}>Attending</h1>
        <p style={styles.subtitle}>{events.length} eventos</p>
      </header>

      {events.length === 0 ? (
        <div style={styles.card}>
          <p style={styles.muted}>Todavía no estás inscrito en ningún evento.</p>
          <Link to="/events" style={{ ...styles.btn, textDecoration: "none", display: "inline-flex" }}>
            Ver eventos
          </Link>
        </div>
      ) : (
        <div style={styles.grid}>
          {events.map((ev) => (
            <EventCard key={ev._id} event={ev} />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 20, maxWidth: 900, margin: "0 auto" },
  backLink: { display: "inline-block", marginBottom: 12, textDecoration: "none", opacity: 0.8 },
  h1: { margin: "0 0 6px", fontSize: 42 },
  subtitle: { margin: 0, opacity: 0.7, fontSize: 16 },
  muted: { opacity: 0.75 },
  error: { color: "crimson", marginBottom: 12 },

  grid: { display: "grid", gap: 12 },

  card: {
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    padding: 16,
    background: "white",
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
  },

  btn: {
    marginTop: 10,
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "white",
    cursor: "pointer",
    boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
    fontWeight: 600,
  },
};
