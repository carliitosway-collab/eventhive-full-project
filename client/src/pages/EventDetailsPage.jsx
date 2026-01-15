import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiMapPin,
  FiCalendar,
  FiUsers,
  FiGlobe,
  FiLock,
  FiMessageCircle,
  FiLoader,
  FiTrash2,
  FiSend,
  FiEdit2,
  FiAlertTriangle,
} from "react-icons/fi";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

import favoritesService from "../services/favorites.service";
import commentsService from "../services/comments.service";
import eventsService from "../services/events.service";

function IconText({ icon: Icon, children, style }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, ...style }}>
      <Icon />
      {children}
    </span>
  );
}

function getNiceError(err) {
  const status = err?.response?.status;

  if (status === 401) return "Tu sesión expiró o no tienes acceso. Inicia sesión de nuevo.";
  if (status === 403) return "No tienes permisos para hacer eso.";
  if (status === 404) return "No encontré ese evento.";
  if (!err?.response) return "No hay conexión o el servidor no responde.";

  return err?.response?.data?.message || "Ha ocurrido un error.";
}

export default function EventDetailsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);

  // comments
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");

  // favorites
  const [favoritesIds, setFavoritesIds] = useState([]);

  // page
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // attend
  const [isAttendLoading, setIsAttendLoading] = useState(false);
  const [attendError, setAttendError] = useState("");

  // fav
  const [isFavLoading, setIsFavLoading] = useState(false);
  const [favError, setFavError] = useState("");

  // owner actions
  const [isOwnerActionLoading, setIsOwnerActionLoading] = useState(false);
  const [ownerError, setOwnerError] = useState("");

  const token = localStorage.getItem("authToken");
  const hasToken = !!token;

  // userId from JWT
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

    eventsService
      .getEventDetails(eventId)
      .then((res) => {
        const payload = res.data?.data ?? res.data;
        const eventData = payload?.event ?? payload;
        setEvent(eventData);
      })
      .catch((err) => {
        console.log(err);
        setError(getNiceError(err));
      })
      .finally(() => setIsLoading(false));
  };

  const fetchComments = () => {
    setCommentError("");

    commentsService
      .getByEvent(eventId)
      .then((res) => setComments(res.data?.data || []))
      .catch((err) => {
        console.log(err);
        setCommentError("No pude cargar comentarios.");
      });
  };

  const fetchFavorites = () => {
    if (!hasToken) return;

    favoritesService
      .getMyFavorites()
      .then((res) => {
        const favs = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setFavoritesIds(favs.map((ev) => ev._id));
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchEvent();
    fetchComments();
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

  const isOwner = useMemo(() => {
    if (!userIdFromToken || !event?.createdBy) return false;

    const ownerId = typeof event.createdBy === "string" ? event.createdBy : event.createdBy?._id;

    return String(ownerId) === String(userIdFromToken);
  }, [event, userIdFromToken]);

  const dateText = event?.date ? new Date(event.date).toLocaleString() : "Sin fecha";

  const handleToggleAttend = () => {
    if (!hasToken) {
      setAttendError("Necesitas login para inscribirte.");
      return;
    }

    setIsAttendLoading(true);
    setAttendError("");

    const request = isAttending ? eventsService.leaveEvent(eventId) : eventsService.joinEvent(eventId);

    request
      .then(() => fetchEvent())
      .catch((err) => {
        console.log(err);
        setAttendError(getNiceError(err));
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

    const request = isFavorite ? favoritesService.removeFavorite(eventId) : favoritesService.addFavorite(eventId);

    request
      .then(() => fetchFavorites())
      .catch((err) => {
        console.log(err);
        setFavError(getNiceError(err));
      })
      .finally(() => setIsFavLoading(false));
  };

  const handleCreateComment = (e) => {
    e.preventDefault();

    if (!hasToken) {
      setCommentError("Necesitas login para comentar.");
      return;
    }

    const clean = commentText.trim();
    if (!clean) {
      setCommentError("Escribe algo antes de enviar.");
      return;
    }

    setIsCommentLoading(true);
    setCommentError("");

    commentsService
      .create({ text: clean, eventId })
      .then(() => {
        setCommentText("");
        fetchComments();
      })
      .catch((err) => {
        console.log(err);
        setCommentError(getNiceError(err));
      })
      .finally(() => setIsCommentLoading(false));
  };

  const handleDeleteComment = (commentId) => {
    if (!hasToken) {
      setCommentError("Necesitas login.");
      return;
    }

    commentsService
      .remove(commentId)
      .then(() => setComments((prev) => prev.filter((c) => c._id !== commentId)))
      .catch((err) => {
        console.log(err);
        setCommentError(getNiceError(err));
      });
  };

  const handleDeleteEvent = () => {
    setOwnerError("");

    if (!hasToken) {
      setOwnerError("Necesitas login.");
      return;
    }

    if (!isOwner) {
      setOwnerError("No tienes permisos para borrar este evento.");
      return;
    }

    const ok = window.confirm("¿Seguro que quieres borrar este evento? Esta acción no se puede deshacer.");
    if (!ok) return;

    setIsOwnerActionLoading(true);

    eventsService
      .deleteEvent(eventId)
      .then(() => navigate("/my-events"))
      .catch((err) => {
        console.log(err);
        setOwnerError(getNiceError(err));
      })
      .finally(() => setIsOwnerActionLoading(false));
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

        <p style={styles.error}>
          <IconText icon={FiAlertTriangle}>{error}</IconText>
        </p>
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
            <span style={{ fontWeight: 700 }}>Creado por:</span> {event.createdBy.name || event.createdBy.email || "—"}
          </div>
        )}

        <div style={styles.actionsRow}>
          <button
            onClick={handleToggleAttend}
            disabled={!hasToken || isAttendLoading}
            style={{ ...styles.btn, opacity: !hasToken || isAttendLoading ? 0.6 : 1 }}
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

        {isOwner && (
          <div style={styles.ownerActionsRow}>
            <Link
              to={`/events/edit/${eventId}`}
              style={{
                ...styles.btn,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <IconText icon={FiEdit2}>Editar</IconText>
            </Link>

            <button
              type="button"
              onClick={handleDeleteEvent}
              disabled={isOwnerActionLoading}
              style={{ ...styles.deleteEventBtn, opacity: isOwnerActionLoading ? 0.6 : 1 }}
            >
              <IconText icon={FiTrash2}>{isOwnerActionLoading ? "Borrando…" : "Borrar"}</IconText>
            </button>
          </div>
        )}

        {attendError && <p style={{ ...styles.error, marginTop: 10 }}>{attendError}</p>}
        {favError && <p style={{ ...styles.error, marginTop: 10 }}>{favError}</p>}
        {ownerError && <p style={{ ...styles.error, marginTop: 10 }}>{ownerError}</p>}

        <div style={styles.commentsBox}>
          <div style={styles.commentsHeader}>
            <IconText icon={FiMessageCircle}>
              Comentarios <b>({comments.length})</b>
            </IconText>
          </div>

          <form onSubmit={handleCreateComment} style={styles.commentForm}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={hasToken ? "Escribe un comentario..." : "Haz login para comentar"}
              disabled={!hasToken || isCommentLoading}
              style={styles.textarea}
              rows={3}
            />

            <button
              type="submit"
              disabled={!hasToken || isCommentLoading}
              style={{
                ...styles.btn,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                opacity: !hasToken || isCommentLoading ? 0.6 : 1,
              }}
            >
              <FiSend />
              {isCommentLoading ? "Enviando…" : "Enviar"}
            </button>
          </form>

          {commentError && <p style={{ ...styles.error, marginTop: 10 }}>{commentError}</p>}

          {comments.length === 0 ? (
            <p style={{ ...styles.muted, marginTop: 10 }}>Todavía no hay comentarios.</p>
          ) : (
            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
              {comments.map((c) => {
                const isMine = userIdFromToken && String(c?.author?._id) === String(userIdFromToken);
                const when = c?.createdAt ? new Date(c.createdAt).toLocaleString() : "";

                return (
                  <div key={c._id} style={styles.commentCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ opacity: 0.85 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>
                          {c?.author?.name || c?.author?.email || "Usuario"}
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.7 }}>{when}</div>
                      </div>

                      {isMine && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(c._id)}
                          style={styles.deleteBtn}
                          title="Borrar comentario"
                          aria-label="Borrar comentario"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>

                    <p style={{ margin: "10px 0 0", opacity: 0.85, lineHeight: 1.45 }}>{c.text}</p>
                  </div>
                );
              })}
            </div>
          )}
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
  ownerActionsRow: { marginTop: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" },
  btn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "white",
    cursor: "pointer",
    boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
    fontWeight: 600,
  },
  deleteEventBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(220, 0, 0, 0.25)",
    background: "white",
    cursor: "pointer",
    boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
    fontWeight: 700,
    color: "crimson",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  commentsBox: { marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(0,0,0,0.08)" },
  commentsHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  commentForm: { display: "grid", gap: 10, marginTop: 10 },
  textarea: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    padding: 12,
    resize: "vertical",
    fontFamily: "inherit",
    boxShadow: "0 6px 14px rgba(0,0,0,0.04)",
  },
  commentCard: {
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 14,
    padding: 12,
    background: "white",
    boxShadow: "0 10px 24px rgba(0,0,0,0.04)",
  },
  deleteBtn: {
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 10,
    padding: "6px 8px",
    background: "white",
    cursor: "pointer",
    opacity: 0.9,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
