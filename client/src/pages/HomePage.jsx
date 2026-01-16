import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiHeart,
  FiMessageCircle,
  FiUsers,
  FiArrowRight,
  FiLoader,
  FiAlertTriangle,
  FiPlus,
  FiLogIn,
} from "react-icons/fi";

import { AuthContext } from "../context/auth.context";
import eventsService from "../services/events.service";
import EventCard from "../components/EventCard";

function IconText({ icon: Icon, children, className }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className || ""}`}>
      <Icon />
      {children}
    </span>
  );
}

function getNiceError(err) {
  if (!err?.response) return "No hay conexión o el servidor no responde.";
  return err?.response?.data?.message || "Ha ocurrido un error.";
}

export default function HomePage() {
  const { isLoggedIn } = useContext(AuthContext);

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUpcoming = () => {
    setIsLoading(true);
    setError("");

    eventsService
      .getPublicEvents()
      .then((res) => {
        const payload = res.data?.data ?? res.data;
        const list = Array.isArray(payload) ? payload : payload?.events || [];
        setEvents(list);
      })
      .catch((err) => {
        console.log(err);
        setError(getNiceError(err));
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchUpcoming();
  }, []);

  const upcoming = useMemo(() => {
    const now = new Date();
    return [...events]
      .filter((ev) => (ev?.date ? new Date(ev.date) >= now : true))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);
  }, [events]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* HERO */}
      <section className="bg-base-100 border rounded-2xl shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Left */}
          <div className="flex flex-col gap-4">
            <p className="text-sm font-bold opacity-70 tracking-wide">EventHive</p>

            <h1 className="text-4xl md:text-5xl font-black leading-tight">
              Descubre eventos y únete en un click
            </h1>

            <p className="text-base opacity-80 max-w-xl">
              Eventos públicos, favoritos, asistencia y comentarios. Todo en un solo sitio, simple y rápido.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/events" className="btn btn-primary">
                <IconText icon={FiArrowRight}>Ver eventos</IconText>
              </Link>

              {isLoggedIn ? (
                <Link to="/events/new" className="btn btn-outline">
                  <IconText icon={FiPlus}>Crear evento</IconText>
                </Link>
              ) : (
                <Link to="/signup" className="btn btn-outline">
                  <IconText icon={FiLogIn}>Crear cuenta</IconText>
                </Link>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="badge badge-outline">
                <IconText icon={FiUsers} className="text-sm">Attend</IconText>
              </span>
              <span className="badge badge-outline">
                <IconText icon={FiHeart} className="text-sm">Favorites</IconText>
              </span>
              <span className="badge badge-outline">
                <IconText icon={FiMessageCircle} className="text-sm">Comments</IconText>
              </span>
              <span className="badge badge-outline">
                <IconText icon={FiCalendar} className="text-sm">Upcoming</IconText>
              </span>
            </div>
          </div>

          {/* Right tip */}
          <div className="flex">
            <div className="card w-full bg-base-100 border rounded-2xl">
              <div className="card-body">
                <h2 className="card-title">Tip rápido</h2>
                <p className="opacity-80">
                  Guarda tus eventos favoritos para tenerlos a mano y vuelve cuando quieras.
                </p>

                <div className="card-actions justify-start pt-2">
                  <Link to="/favorites" className="btn btn-ghost">
                    <IconText icon={FiHeart}>Ir a favoritos</IconText>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mt-8 bg-base-100 border rounded-2xl shadow-sm p-6">
        <h2 className="text-2xl font-extrabold">Cómo funciona</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="card bg-base-100 border rounded-xl">
            <div className="card-body">
              <h3 className="card-title">1. Explora eventos</h3>
              <p className="opacity-80">
                Descubre eventos públicos y entra al detalle para ver fecha, ubicación y asistentes.
              </p>
            </div>
          </div>

          <div className="card bg-base-100 border rounded-xl">
            <div className="card-body">
              <h3 className="card-title">2. Interactúa</h3>
              <p className="opacity-80">
                Inscríbete, guarda eventos en favoritos y participa en los comentarios.
              </p>
            </div>
          </div>

          <div className="card bg-base-100 border rounded-xl">
            <div className="card-body">
              <h3 className="card-title">3. Organízate</h3>
              <p className="opacity-80">
                Accede a tus favoritos cuando quieras o crea tus propios eventos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* UPCOMING PREVIEW */}
      <section className="mt-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-extrabold">Próximos eventos</h2>
          <Link to="/events" className="link link-hover font-semibold">
            <IconText icon={FiArrowRight}>Ver todos</IconText>
          </Link>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <p className="opacity-75">
              <IconText icon={FiLoader}>Cargando eventos…</IconText>
            </p>
          ) : error ? (
            <div className="alert alert-error">
              <IconText icon={FiAlertTriangle}>{error}</IconText>
              <button type="button" onClick={fetchUpcoming} className="btn btn-sm btn-outline">
                Reintentar
              </button>
            </div>
          ) : upcoming.length === 0 ? (
            <div className="card bg-base-100 border rounded-2xl">
              <div className="card-body">
                <p className="opacity-75">No hay eventos próximos todavía.</p>
                <div className="card-actions">
                  <Link to="/events" className="btn btn-primary">
                    <IconText icon={FiArrowRight}>Explorar eventos</IconText>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcoming.map((ev) => (
                <EventCard key={ev._id} event={ev} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
