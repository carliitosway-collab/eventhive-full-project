import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit2,
  FiLoader,
  FiAlertTriangle,
  FiSave,
  FiCalendar,
  FiMapPin,
  FiType,
  FiFileText,
  FiLock,
} from "react-icons/fi";
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
  if (status === 403) return "No tienes permisos para editar este evento.";
  if (status === 404) return "No encontré ese evento.";
  if (!err?.response) return "No hay conexión o el servidor no responde.";

  return err?.response?.data?.message || "Ha ocurrido un error.";
}

// ISO -> "YYYY-MM-DDTHH:MM" (local) para <input type="datetime-local" />
function toDateTimeLocalValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());

  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export default function EditEventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");
  const hasToken = !!token;

  const [event, setEvent] = useState(null);

  // form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateLocal, setDateLocal] = useState("");
  const [location, setLocation] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  // ui
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // userId desde JWT
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

  // Guard-rail visual: owner del evento
  const isOwner = useMemo(() => {
    if (!userIdFromToken || !event?.createdBy) return false;

    const ownerId =
      typeof event.createdBy === "string" ? event.createdBy : event.createdBy?._id;

    return String(ownerId) === String(userIdFromToken);
  }, [event, userIdFromToken]);

  const prefillForm = (eventData) => {
    setTitle(eventData?.title || "");
    setDescription(eventData?.description || "");
    setLocation(eventData?.location || "");
    setIsPublic(eventData?.isPublic ?? true);
    setDateLocal(toDateTimeLocalValue(eventData?.date));
  };

  const fetchEvent = () => {
    setIsLoading(true);
    setError("");

    eventsService
      .getEventDetails(eventId)
      .then((res) => {
        const payload = res.data?.data ?? res.data;
        const eventData = payload?.event ?? payload;

        setEvent(eventData);
        prefillForm(eventData);
      })
      .catch((err) => {
        console.log(err);
        setError(getNiceError(err));
        setEvent(null);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    // Si por lo que sea llegas aquí sin token, fuera
    if (!hasToken) {
      navigate("/login");
      return;
    }

    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!hasToken) {
      setError("Necesitas login para editar eventos.");
      return;
    }

    if (!isOwner) {
      setError("No tienes permisos para editar este evento.");
      return;
    }

    const cleanTitle = title.trim();
    const cleanDesc = description.trim();
    const cleanLoc = location.trim();

    if (!cleanTitle || !cleanDesc || !cleanLoc || !dateLocal) {
      setError("Completa title, description, date y location.");
      return;
    }

    const isoDate = new Date(dateLocal).toISOString();

    setIsSaving(true);

    eventsService
      .updateEvent(eventId, {
        title: cleanTitle,
        description: cleanDesc,
        location: cleanLoc,
        date: isoDate,
        isPublic,
      })
      .then(() => navigate(`/events/${eventId}`))
      .catch((err) => {
        console.log(err);
        setError(getNiceError(err));
      })
      .finally(() => setIsSaving(false));
  };

  // LOADING
  if (isLoading) {
    return (
      <div style={styles.page}>
        <Link to="/my-events" style={styles.backLink}>
          <IconText icon={FiArrowLeft}>Volver</IconText>
        </Link>

        <h1 style={styles.h1}>
          <IconText icon={FiEdit2}>Edit Event</IconText>
        </h1>

        <p style={styles.muted}>
          <IconText icon={FiLoader}>Cargando…</IconText>
        </p>
      </div>
    );
  }

  // ERROR + no event
  if (!event) {
    return (
      <div style={styles.page}>
        <Link to="/my-events" style={styles.backLink}>
          <IconText icon={FiArrowLeft}>Volver</IconText>
        </Link>

        <div style={styles.card}>
          <h1 style={{ ...styles.h1, marginBottom: 10 }}>
            <IconText icon={FiAlertTriangle}>No se pudo cargar</IconText>
          </h1>

          <p style={styles.error}>{error || "No encontré el evento."}</p>

          <button type="button" onClick={fetchEvent} style={styles.btn}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // NOT OWNER (guard rail visual)
  if (hasToken && !isOwner) {
    return (
      <div style={styles.page}>
        <Link to={`/events/${eventId}`} style={styles.backLink}>
          <IconText icon={FiArrowLeft}>Volver</IconText>
        </Link>

        <div style={styles.card}>
          <h1 style={{ ...styles.h1, marginBottom: 10 }}>
            <IconText icon={FiLock}>Sin permisos</IconText>
          </h1>

          <p style={styles.muted}>Este evento no es tuyo, así que no puedes editarlo.</p>

          <Link
            to={`/events/${eventId}`}
            style={{
              ...styles.btn,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FiArrowLeft />
            Volver al detalle
          </Link>
        </div>
      </div>
    );
  }

  // FORM
  return (
    <div style={styles.page}>
      <Link to={`/events/${eventId}`} style={styles.backLink}>
        <IconText icon={FiArrowLeft}>Volver</IconText>
      </Link>

      <header style={{ marginBottom: 14 }}>
        <h1 style={styles.h1}>
          <IconText icon={FiEdit2}>Edit Event</IconText>
        </h1>
        <p style={styles.subtitle}>Actualiza tu evento y guarda cambios</p>
      </header>

      <section style={styles.card}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            <span style={styles.labelTitle}>
              <IconText icon={FiType}>Title</IconText>
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
              placeholder="Ej: Ocean Meetup"
              disabled={isSaving}
              autoComplete="off"
            />
          </label>

          <label style={styles.label}>
            <span style={styles.labelTitle}>
              <IconText icon={FiFileText}>Description</IconText>
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={styles.textarea}
              placeholder="Cuéntanos de qué va el evento"
              rows={4}
              disabled={isSaving}
            />
          </label>

          <div style={styles.row2}>
            <label style={styles.label}>
              <span style={styles.labelTitle}>
                <IconText icon={FiCalendar}>Date</IconText>
              </span>
              <input
                type="datetime-local"
                value={dateLocal}
                onChange={(e) => setDateLocal(e.target.value)}
                style={styles.input}
                disabled={isSaving}
              />
            </label>

            <label style={styles.label}>
              <span style={styles.labelTitle}>
                <IconText icon={FiMapPin}>Location</IconText>
              </span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={styles.input}
                placeholder="Ej: Madrid"
                disabled={isSaving}
                autoComplete="off"
              />
            </label>
          </div>

          <label style={styles.publicBox}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 800 }}>Public event</div>
                <div style={{ opacity: 0.75, fontSize: 14 }}>
                  {isPublic ? "Visible para todos" : "Solo tú lo ves"}
                </div>
              </div>

              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                style={{ transform: "scale(1.2)" }}
                disabled={isSaving}
              />
            </div>
          </label>

          {error && (
            <p style={styles.error}>
              <IconText icon={FiAlertTriangle}>{error}</IconText>
            </p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            style={{
              ...styles.btn,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              opacity: isSaving ? 0.65 : 1,
            }}
          >
            <FiSave />
            {isSaving ? "Guardando…" : "Save changes"}
          </button>
        </form>
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
  error: { color: "crimson", marginTop: 10 },

  card: {
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    padding: 16,
    background: "white",
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
  },

  form: { display: "grid", gap: 12 },
  row2: { display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" },

  label: { display: "grid", gap: 8 },
  labelTitle: { fontWeight: 800 },

  input: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    padding: "12px 12px",
    fontFamily: "inherit",
    boxShadow: "0 6px 14px rgba(0,0,0,0.04)",
  },

  textarea: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    padding: 12,
    resize: "vertical",
    fontFamily: "inherit",
    boxShadow: "0 6px 14px rgba(0,0,0,0.04)",
  },

  publicBox: {
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 14,
    padding: 14,
    background: "white",
    boxShadow: "0 10px 24px rgba(0,0,0,0.04)",
  },

  btn: {
    marginTop: 6,
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "white",
    cursor: "pointer",
    boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
    fontWeight: 700,
    width: "fit-content",
  },
};
