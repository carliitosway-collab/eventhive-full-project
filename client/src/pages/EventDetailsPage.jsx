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
import PageLayout from "../layouts/PageLayout";

function IconText({ icon: Icon, children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
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
    const currentId = event?._id;
    if (!currentId) return false;
    return favoritesIds.some((id) => String(id) === String(currentId));
  }, [favoritesIds, event?._id]);

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

    const targetId = event?._id || eventId;
    const request = isFavorite
      ? favoritesService.removeFavorite(targetId)
      : favoritesService.addFavorite(targetId);

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
      <PageLayout>
        <Link to="/events" className="btn btn-ghost btn-sm mb-4">
          <IconText icon={FiArrowLeft}>Volver</IconText>
        </Link>

        <h1 className="text-4xl font-black mb-4">Event Details</h1>

        <p className="opacity-75">
          <IconText icon={FiLoader}>Cargando…</IconText>
        </p>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <Link to="/events" className="btn btn-ghost btn-sm mb-4">
          <IconText icon={FiArrowLeft}>Volver</IconText>
        </Link>

        <h1 className="text-4xl font-black mb-4">Event Details</h1>

        <div className="alert alert-error">
          <IconText icon={FiAlertTriangle}>{error}</IconText>
        </div>
      </PageLayout>
    );
  }

  if (!event) {
    return (
      <PageLayout>
        <Link to="/events" className="btn btn-ghost btn-sm mb-4">
          <IconText icon={FiArrowLeft}>Volver</IconText>
        </Link>

        <h1 className="text-4xl font-black mb-2">Event Details</h1>
        <p className="opacity-75">No encontré el evento.</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Link to="/events" className="btn btn-ghost btn-sm mb-4">
        <IconText icon={FiArrowLeft}>Volver</IconText>
      </Link>

      <header className="mb-4">
        <h1 className="text-4xl font-black">{event.title}</h1>

        <p className="opacity-70 mt-2">
          {event.isPublic ? (
            <IconText icon={FiGlobe}>Evento público</IconText>
          ) : (
            <IconText icon={FiLock}>Evento privado</IconText>
          )}
        </p>
      </header>

      <section className="card bg-base-100 border rounded-2xl">
        <div className="card-body">
          <p className="opacity-85 leading-relaxed">
            {event.description || "Sin descripción"}
          </p>

          <div className="flex flex-wrap gap-3 mt-4 text-sm opacity-85">
            <span className="inline-flex items-center gap-2">
              <FiMapPin />
              {event.location || "Sin ubicación"}
            </span>

            <span className="inline-flex items-center gap-2">
              <FiCalendar />
              {dateText}
            </span>
          </div>

          {event.createdBy && (
            <div className="mt-3 opacity-80">
              <span className="font-bold">Creado por:</span>{" "}
              {event.createdBy.name || event.createdBy.email || "—"}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleToggleAttend}
              disabled={!hasToken || isAttendLoading}
              className="btn btn-primary"
            >
              {isAttendLoading ? (
                <IconText icon={FiLoader}>Procesando…</IconText>
              ) : isAttending ? (
                "Salir (Leave)"
              ) : (
                "Inscribirme (Attend)"
              )}
            </button>

            <button
              type="button"
              onClick={handleToggleFavorite}
              disabled={!hasToken || isFavLoading}
              className="btn btn-outline"
              aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
              title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
            >
              {isFavLoading ? (
                <IconText icon={FiLoader}>Guardando…</IconText>
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

            <span className="opacity-75 inline-flex items-center gap-2">
              <FiUsers />
              Asistentes: <b>{event.attendees?.length || 0}</b>
            </span>

            {!hasToken && <span className="opacity-70">(haz login para interactuar)</span>}
          </div>

          {isOwner && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link to={`/events/edit/${eventId}`} className="btn btn-outline">
                <IconText icon={FiEdit2}>Editar</IconText>
              </Link>

              <button
                type="button"
                onClick={handleDeleteEvent}
                disabled={isOwnerActionLoading}
                className="btn btn-error"
              >
                <IconText icon={FiTrash2}>
                  {isOwnerActionLoading ? "Borrando…" : "Borrar"}
                </IconText>
              </button>
            </div>
          )}

          {attendError && (
            <div className="alert alert-error mt-4">
              <IconText icon={FiAlertTriangle}>{attendError}</IconText>
            </div>
          )}

          {favError && (
            <div className="alert alert-error mt-4">
              <IconText icon={FiAlertTriangle}>{favError}</IconText>
            </div>
          )}

          {ownerError && (
            <div className="alert alert-error mt-4">
              <IconText icon={FiAlertTriangle}>{ownerError}</IconText>
            </div>
          )}

          {/* Comments */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold inline-flex items-center gap-2">
                <FiMessageCircle />
                Comentarios <span className="opacity-75">({comments.length})</span>
              </h2>
            </div>

            <form onSubmit={handleCreateComment} className="mt-4 grid gap-3">
              <textarea
                className="textarea textarea-bordered w-full"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={hasToken ? "Escribe un comentario..." : "Haz login para comentar"}
                disabled={!hasToken || isCommentLoading}
                rows={3}
              />

              <button
                type="submit"
                disabled={!hasToken || isCommentLoading}
                className="btn btn-primary w-fit"
              >
                <IconText icon={FiSend}>
                  {isCommentLoading ? "Enviando…" : "Enviar"}
                </IconText>
              </button>
            </form>

            {commentError && (
              <div className="alert alert-error mt-4">
                <IconText icon={FiAlertTriangle}>{commentError}</IconText>
              </div>
            )}

            {comments.length === 0 ? (
              <p className="opacity-75 mt-4">Todavía no hay comentarios.</p>
            ) : (
              <div className="mt-4 grid gap-3">
                {comments.map((c) => {
                  const isMine = userIdFromToken && String(c?.author?._id) === String(userIdFromToken);
                  const when = c?.createdAt ? new Date(c.createdAt).toLocaleString() : "";

                  return (
                    <div key={c._id} className="card bg-base-100 border rounded-xl">
                      <div className="card-body p-4">
                        <div className="flex justify-between gap-4">
                          <div className="opacity-85">
                            <div className="font-bold text-sm">
                              {c?.author?.name || c?.author?.email || "Usuario"}
                            </div>
                            <div className="text-xs opacity-70">{when}</div>
                          </div>

                          {isMine && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(c._id)}
                              className="btn btn-ghost btn-sm"
                              title="Borrar comentario"
                              aria-label="Borrar comentario"
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </div>

                        <p className="mt-3 opacity-85 leading-relaxed">{c.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
