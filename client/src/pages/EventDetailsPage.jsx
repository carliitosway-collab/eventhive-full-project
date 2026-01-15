import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiMapPin,
  FiCalendar,
  FiUsers,
  FiGlobe,
  FiLock,
  FiMessageCircle,
  FiLoader,
} from "react-icons/fi";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

import api from "../services/api.service";
import favoritesService from "../services/favorites.service";

function IconText({ icon: Icon, children, style }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, ...style }}>
      <Icon />
      {children}
    </span>
  );
}

export default function EventDetailsPage() {
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [favoritesIds, setFavoritesIds] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isAttendLoading, setIsAttendLoading] = useState(false);
  const [attendError, setAttendError] = useState("");

  const [isFavLoading, setIsFavLoading] = useState(false);
  const [favError, setFavError] = useState("");

  const token = localStorage.getItem("authToken");
  const hasToken = !!token;

  // ✅ userId desde JWT (por si luego lo necesitas)
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

  const fetchEvent = () => {
    setIsLoading(true);
    setError("");

    api
      .get(`/events/${eventId}`)
      .then((res) => {
        const payload = res.data?.data ?? res.data;
        const eventData = payload?.event ?? payload;
        const commentsData = payload?.comments ?? [];
        setEvent(eventData);
        setComments(commentsData);
      })
      .catch((err) => {
        console.log(err);
        setError("No pude cargar el detalle del evento.");
      })
      .finally(() => setIsLoading(false));
  };

  const fetchFavorites = () => {
    if (!hasToken) return;

    favoritesService
      .getMyFavorites()
      .then((res) => {
        const favs = res.data?.data || [];
        setFavoritesIds(favs.map((ev) => ev._id));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchEvent();
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const isAttending = useMemo(() => {
    if (!event?.attendees || !userIdFromToken) return false;
    return event.attendees.some((u) => String(u._id) === String(userIdFromToken));
  }, [event, userIdFromToken]);

  const isFavorite = useMemo(() => {
    return favoritesIds.some((id) => String(id) === String(eventId));
  }, [favoritesIds, eventId]);

  const dateText = event?.date ? new Date(event.date).toLocaleString() : "Sin fecha";

  const handleToggleAttend = () => {
    if (!hasToken) {
      setAttendError("Necesitas login para inscribirte.");
      return;
    }

    setIsAttendLoading(true);
    setAttendError("");

    const request = isAttending
      ? api.delete(`/events/${eventId}/join`)
      : api.post(`/events/${eventId}/join`);

    request
      .then(() => fetchEvent())
      .catch((err) => {
        console.log(err);
        setAttendError(err?.response?.data?.message || "No pude actualizar tu inscripción.");
      })
      .finally(() => setIsAttendLoading(false));
  };

  const handleToggleFavorite = () => {
    if (!hasToken) {
      setFavError("Necesitas login para guardar favoritos.");
      return;
    }

    setIsFavLoading(true);
    setFavError("");

    const request = isFavorite
      ? favoritesService.removeFavorite(eventId)
      : favoritesService.addFavorite(eventId);

    request
      .then(() => fetchFavorites())
      .catch((err) => {
        console.log(err);
        setFavError(err?.response?.data?.message || "No pude actualizar favoritos.");
      })
      .finally(() => setIsFavLoading(false));
  };

  if (isLoading) {
    return (
      <div style={styles.page}>
        <Link to="/events" style={styles.backLink}>
          <IconText icon={FiArrowLeft}>Volver</IconText>
        </Link>
        <h1 style={styles.h1}>Event Details</h1>
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
        <h1 style={styles.h1}>Event Details</h1>
        <p style={styles.error}>{error}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={styles.page}>
        <Link to="/events" style={styles.backLink}>
          <IconText icon={FiArrowLeft}>Volver</IconText>
        </Link>
        <h1 style={styles.h1}>Event Details</h1>
        <p style={styles.muted}>No encontré el evento.</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Link to="/events" style={styles.backLink}>
        <IconText icon={FiArrowLeft}>Volver</IconText>
      </Link>

      <header style={{ marginBottom: 14 }}>
        <h1 style={styles.h1}>{event.title}</h1>
        <p style={styles.subtitle}>
          {event.isPublic ? (
            <IconText icon={FiGlobe}>Evento público</IconText>
          ) : (
            <IconText icon={FiLock}>Evento privado</IconText>
          )}
        </p>
      </header>

      <section style={styles.card}>
        <p style={styles.desc}>{event.description || "Sin descripción"}</p>

        <div style={styles.metaRow}>
          <span style={styles.metaItem}>
            <IconText icon={FiMapPin}>{event.location || "Sin ubicación"}</IconText>
          </span>
          <span style={styles.metaItem}>
            <IconText icon={FiCalendar}>{dateText}</IconText>
          </span>
        </div>

        {event.createdBy && (
          <div style={{ marginTop: 12, opacity: 0.8 }}>
            <span style={{ fontWeight: 600 }}>Creado por:</span>{" "}
            {event.createdBy.name || event.createdBy.email || "—"}
          </div>
        )}

        <div style={styles.actionsRow}>
          <button
            onClick={handleToggleAttend}
            disabled={!hasToken || isAttendLoading}
            style={{
              ...styles.btn,
              opacity: !hasToken || isAttendLoading ? 0.6 : 1,
            }}
          >
            {isAttendLoading ? "Procesando…" : isAttending ? "Salir (Leave)" : "Inscribirme (Attend)"}
          </button>

          <button
            onClick={handleToggleFavorite}
            disabled={!hasToken || isFavLoading}
            style={{
              ...styles.btn,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              opacity: !hasToken || isFavLoading ? 0.6 : 1,
            }}
            aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
            title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            {isFavLoading ? (
              "Guardando…"
            ) : isFavorite ? (
              <>
                <AiFillHeart size={18} />
                Favorito
              </>
            ) : (
              <>
                <AiOutlineHeart size={18} />
                Favorito
              </>
            )}
          </button>

          <span style={{ opacity: 0.75 }}>
            <IconText icon={FiUsers}>
              Asistentes: <b>{event.attendees?.length || 0}</b>
            </IconText>
          </span>

          {!hasToken && <span style={{ opacity: 0.7 }}>(haz login para interactuar)</span>}
        </div>

        {attendError && <p style={{ ...styles.error, marginTop: 10 }}>{attendError}</p>}
        {favError && <p style={{ ...styles.error, marginTop: 10 }}>{favError}</p>}

        <div style={styles.nextBox}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <IconText icon={FiMessageCircle}>
              Comments cargados: <b>{comments.length}</b>
            </IconText>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { padding: 20, maxWidth: 900, margin: "0 auto" },
  backLink: { display: "inline-block", marginBottom: 12, textDecoration: "none", opacity: 0.8 },
  h1: { margin: "0 0 6px", fontSize: 42 },
  subtitle: { margin: 0, opacity: 0.7, fontSize: 16 },
  muted: { opacity: 0.75 },
  error: { color: "crimson" },
  card: {
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    padding: 16,
    background: "white",
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
  },
  desc: { margin: "0 0 12px", opacity: 0.85, lineHeight: 1.45 },
  metaRow: { display: "flex", gap: 14, flexWrap: "wrap", opacity: 0.85, fontSize: 14 },
  metaItem: { display: "inline-flex", alignItems: "center", gap: 6 },
  actionsRow: { marginTop: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" },
  btn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "white",
    cursor: "pointer",
    boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
    fontWeight: 600,
  },
  nextBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    background: "rgba(0,0,0,0.03)",
    opacity: 0.85,
    fontSize: 14,
  },
};
