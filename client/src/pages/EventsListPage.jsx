import { useEffect, useState } from "react";
import eventsService from "../services/events.service";
import EventCard from "../components/EventCard";

export default function EventsListPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLoading(true);
    setError("");

    eventsService
      .getPublicEvents()
      .then((res) => setEvents(res.data?.data || res.data || []))
      .catch((err) => {
        console.log(err);
        setError("No pude cargar eventos. Revisa que el backend esté encendido.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.h1}>Events</h1>
        <p style={styles.subtitle}>Eventos públicos disponibles</p>
      </header>

      {isLoading && <p style={styles.muted}>Cargando eventos…</p>}
      {!isLoading && error && <p style={styles.error}>{error}</p>}

      {!isLoading && !error && events.length === 0 ? (
        <p style={styles.muted}>No events yet.</p>
      ) : (
        !isLoading &&
        !error && (
          <div style={styles.grid}>
            {events.map((ev) => (
              <EventCard key={ev._id} event={ev} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

const styles = {
  page: { padding: 20, maxWidth: 1000, margin: "0 auto" },
  header: { marginBottom: 14 },
  h1: { margin: "0 0 6px", fontSize: 44 },
  subtitle: { margin: 0, opacity: 0.75, fontSize: 18 },
  muted: { opacity: 0.75 },
  error: { color: "crimson" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 14,
    marginTop: 14,
  },
};
