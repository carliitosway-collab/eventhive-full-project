import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEdit2, FiTrash2, FiLoader, FiAlertTriangle } from "react-icons/fi";
import eventsService from "../services/events.service";
import { getNiceHttpError } from "../utils/httpErrors";

function IconText({ icon: Icon, children, style }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, ...style }}>
      <Icon />
      {children}
    </span>
  );
}

export default function MyEventsPage() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyEvents = () => {
    setIsLoading(true);
    setError("");

    eventsService
      .getMyEvents()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setEvents(data);
      })
      .catch((err) => {
        console.log(err);
        setError(getNiceHttpError(err, "No pude cargar tus eventos."));
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  // userId desde JWT (guard rail visual)
  const token = localStorage.getItem("authToken");
  const userIdFromToken = useMemo(() => {
    if (!token) return null;
    try {
      const payloadBase64 = token.split(".")[1];
      const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
      const payload = JSON.parse(payloadJson);
      return payload?._id || payload?.id || payload?.userId || null;
    } catch (e) {
      console.log("Token decode error:", e);
      return null;
    }
  }, [token]);

  const handleDelete = (eventId) => {
    const ok = window.confirm(
      "¿Seguro que quieres borrar este evento? Esta acción no se puede deshacer."
    );
    if (!ok) return;

    const previous = events;
    setEvents((prev) => prev.filter((ev) => ev._id !== eventId));

    eventsService.deleteEvent(eventId).catch((err) => {
      console.log(err);
      setEvents(previous);
      setError(getNiceHttpError(err, "No pude borrar el evento."));
    });
  };

  if (isLoading) {
    return (
      <div style={styles.page}>
        <Link to="/events" style={styles.backLink}>
          <IconText icon={FiArrowLeft}>Volver</IconText>
        </Link>

        <h1 style={styles.h1}>My Events</h1>

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

        <h1 style={styles.h1}>My Events</h1>

        <p style={styles.error}>
          <IconText icon={FiAlertTriangle}>{error}</IconText>
        </p>

        <button type="button" onClick={fetchMyEvents} style={styles.btn}>
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
        <h1 style={styles.h1}>My Events</h1>
        <p style={styles.subtitle}>{events.length} eventos creados</p>
      </header>

      {events.length === 0 ? (
        <div style={styles.card}>
          <p style={styles.muted}>No has creado eventos todavía.</p>
          <button type="button" style={styles.btn} onClick={() => navigate("/events/new")}>
            Crear evento
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {events.map((ev) => {
            const isOwner =
              userIdFromToken &&
              (String(ev?.createdBy?._id) === String(userIdFromToken) ||
                String(ev?.createdBy) === String(userIdFromToken));

            return (
              <div key={ev._id} style={styles.rowCard}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{ev.title}</h3>
                    <p style={{ margin: "6px 0 0", opacity: 0.75, fontSize: 14 }}>
                      {ev.location || "Sin ubicación"}
                    </p>
                  </div>

                  {isOwner && (
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <Link to={`/events/${ev._id}`} style={{ textDecoration: "none", opacity: 0.85 }}>
                        Ver
                      </Link>

                      <Link to={`/events/edit/${ev._id}`} style={styles.actionLink}>
                        <IconText icon={FiEdit2}>Editar</IconText>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(ev._id)}
                        style={styles.deleteBtn}
                      >
                        <IconText icon={FiTrash2}>Borrar</IconText>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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

  rowCard: {
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

  actionLink: {
    textDecoration: "none",
    border: "1px solid rgba(0,0,0,0.15)",
    padding: "8px 10px",
    borderRadius: 12,
    background: "white",
    boxShadow: "0 6px 14px rgba(0,0,0,0.04)",
    fontWeight: 600,
    color: "inherit",
  },

  deleteBtn: {
    border: "1px solid rgba(220, 0, 0, 0.25)",
    padding: "8px 10px",
    borderRadius: 12,
    background: "white",
    cursor: "pointer",
    boxShadow: "0 6px 14px rgba(0,0,0,0.04)",
    fontWeight: 700,
    color: "crimson",
  },
};
