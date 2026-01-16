import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEdit2, FiTrash2, FiLoader, FiAlertTriangle } from "react-icons/fi";

import eventsService from "../services/events.service";
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

  return (
    <PageLayout>
      <Link to="/events" className="link link-hover inline-flex items-center gap-2 opacity-80">
        <IconText icon={FiArrowLeft}>Volver</IconText>
      </Link>

      <header className="mt-3 mb-6">
        <h1 className="text-4xl md:text-5xl font-black">My Events</h1>

        {!isLoading && !error && (
          <p className="opacity-70 mt-2">{events.length} eventos creados</p>
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

          <button type="button" onClick={fetchMyEvents} className="btn btn-outline btn-sm">
            Reintentar
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="card bg-base-100 border rounded-2xl">
          <div className="card-body">
            <p className="opacity-75">No has creado eventos todavía.</p>

            <div className="card-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate("/events/new")}
              >
                Crear evento
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((ev) => {
            const isOwner =
              userIdFromToken &&
              (String(ev?.createdBy?._id) === String(userIdFromToken) ||
                String(ev?.createdBy) === String(userIdFromToken));

            return (
              <div key={ev._id} className="card bg-base-100 border rounded-2xl">
                <div className="card-body">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="text-lg font-bold m-0">{ev.title}</h3>
                      <p className="mt-1 opacity-70 text-sm">
                        {ev.location || "Sin ubicación"}
                      </p>
                    </div>

                    {isOwner && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link to={`/events/${ev._id}`} className="link link-hover font-semibold">
                          Ver
                        </Link>

                        <Link to={`/events/edit/${ev._id}`} className="btn btn-outline btn-sm">
                          <IconText icon={FiEdit2}>Editar</IconText>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(ev._id)}
                          className="btn btn-outline btn-sm btn-error"
                        >
                          <IconText icon={FiTrash2}>Borrar</IconText>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
