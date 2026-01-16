import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiLoader, FiAlertTriangle } from "react-icons/fi";

import eventsService from "../services/events.service";
import EventCard from "../components/EventCard";
import { getNiceHttpError } from "../utils/httpErrors";
import PageLayout from "../layouts/PageLayout";

function IconText({ icon: Icon, children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
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

  return (
    <PageLayout>
      <Link to="/events" className="link link-hover inline-flex items-center gap-2 opacity-80">
        <IconText icon={FiArrowLeft}>Volver</IconText>
      </Link>

      <header className="mt-3 mb-6">
        <h1 className="text-4xl md:text-5xl font-black">Attending</h1>

        {!isLoading && !error && (
          <p className="opacity-70 mt-2">{events.length} eventos</p>
        )}
      </header>

      {isLoading ? (
        <p className="opacity-75">
          <IconText icon={FiLoader}>Cargando…</IconText>
        </p>
      ) : error ? (
        <div className="space-y-3">
          <div className="alert alert-error">
            <IconText icon={FiAlertTriangle}>{error}</IconText>
          </div>

          <button type="button" onClick={fetchAttending} className="btn btn-outline btn-sm">
            Reintentar
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="card bg-base-100 border rounded-2xl">
          <div className="card-body">
            <p className="opacity-75">Todavía no estás inscrito en ningún evento.</p>

            <div className="card-actions">
              <Link to="/events" className="btn btn-primary">
                Ver eventos
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((ev) => (
            <EventCard key={ev._id} event={ev} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
