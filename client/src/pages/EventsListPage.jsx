import { useEffect, useState } from "react";
import { FiLoader, FiAlertTriangle } from "react-icons/fi";

import eventsService from "../services/events.service";
import EventCard from "../components/EventCard";
import PageLayout from "../layouts/PageLayout";

function IconText({ icon: Icon, children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Icon />
      {children}
    </span>
  );
}

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
    <PageLayout>
      <header className="mb-6">
        <h1 className="text-4xl md:text-5xl font-black">Events</h1>
        <p className="opacity-70 mt-2">Eventos públicos disponibles</p>
      </header>

      {isLoading ? (
        <p className="opacity-75">
          <IconText icon={FiLoader}>Cargando eventos…</IconText>
        </p>
      ) : error ? (
        <div className="alert alert-error">
          <IconText icon={FiAlertTriangle}>{error}</IconText>
        </div>
      ) : events.length === 0 ? (
        <div className="card bg-base-100 border rounded-2xl">
          <div className="card-body">
            <p className="opacity-75">No events yet.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((ev) => (
            <EventCard key={ev._id} event={ev} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
