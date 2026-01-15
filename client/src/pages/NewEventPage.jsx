import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiLoader, FiAlertTriangle, FiPlus, FiCalendar, FiMapPin, FiType, FiFileText } from "react-icons/fi";
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

function isValidDateTimeLocal(value) {
  // value esperado: "YYYY-MM-DDTHH:MM"
  if (!value) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

function nowAsMinDateTimeLocal() {
  // min para datetime-local: "YYYY-MM-DDTHH:MM"
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export default function NewEventPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(""); // datetime-local string
  const [location, setLocation] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const cleanTitle = title.trim();
    const cleanDesc = description.trim();
    const cleanLoc = location.trim();

    if (!cleanTitle || !cleanDesc || !date || !cleanLoc) {
      setError("Completa title, description, date y location.");
      return;
    }

    if (!isValidDateTimeLocal(date)) {
      setError("La fecha no es válida. Usa el selector de fecha y hora.");
      return;
    }

    setIsLoading(true);

    const payload = {
      title: cleanTitle,
      description: cleanDesc,
      date: new Date(date).toISOString(),
      location: cleanLoc,
      isPublic,
    };

    eventsService
      .createEvent(payload)
      .then((res) => {
        const created = res.data?.data || res.data;
        const createdId = created?._id;

        if (createdId) navigate(`/events/${createdId}`);
        else navigate("/my-events");
      })
      .catch((err) => {
        console.log(err);
        setError(getNiceHttpError(err, "No pude crear el evento."));
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div style={styles.page}>
      <Link to="/events" style={styles.backLink}>
        <IconText icon={FiArrowLeft}>Volver</IconText>
      </Link>

      <header style={{ marginBottom: 14 }}>
        <h1 style={styles.h1}>New Event</h1>
        <p style={styles.subtitle}>Crea un evento público o privado</p>
      </header>

      <section style={styles.card}>
        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <label style={styles.label}>
            <span style={styles.labelTitle}>
              <IconText icon={FiType}>Title</IconText>
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
              placeholder="Ej: Ocean Meetup"
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </label>

          <div style={styles.row2}>
            <label style={styles.label}>
              <span style={styles.labelTitle}>
                <IconText icon={FiCalendar}>Date</IconText>
              </span>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={styles.input}
                disabled={isLoading}
                min={nowAsMinDateTimeLocal()}
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
                disabled={isLoading}
                autoComplete="off"
              />
            </label>
          </div>

          <label style={styles.switchRow}>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={isLoading}
            />
            <span style={{ fontWeight: 700 }}>
              {isPublic ? "Public event" : "Private event"}
            </span>
            <span style={{ opacity: 0.7, fontSize: 13 }}>
              {isPublic ? "Visible para todos" : "Solo tú podrás verlo"}
            </span>
          </label>

          {error && (
            <p style={styles.error}>
              <IconText icon={FiAlertTriangle}>{error}</IconText>
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.btn,
              opacity: isLoading ? 0.65 : 1,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {isLoading ? (
              <IconText icon={FiLoader}>Creating…</IconText>
            ) : (
              <IconText icon={FiPlus}>Create Event</IconText>
            )}
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

  card: {
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    padding: 16,
    background: "white",
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
  },

  form: { display: "grid", gap: 12 },
  label: { display: "grid", gap: 8 },
  labelTitle: { fontWeight: 800 },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },

  input: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    fontFamily: "inherit",
    boxShadow: "0 6px 14px rgba(0,0,0,0.04)",
  },

  textarea: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    fontFamily: "inherit",
    resize: "vertical",
    boxShadow: "0 6px 14px rgba(0,0,0,0.04)",
  },

  switchRow: {
    display: "grid",
    gap: 6,
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(0,0,0,0.02)",
  },

  error: { color: "crimson", margin: 0 },

  btn: {
    marginTop: 4,
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "white",
    cursor: "pointer",
    boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
    fontWeight: 800,
    justifySelf: "start",
  },
};
