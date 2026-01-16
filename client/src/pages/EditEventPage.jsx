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

    const ownerId = typeof event.createdBy === "string" ? event.createdBy : event.createdBy?._id;

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
      <PageLayout>
        <Link to="/my-events" className="btn btn-ghost btn-sm mb-4">
          <IconText icon={FiArrowLeft}>Volver</IconText>
        </Link>

        <h1 className="text-4xl font-black mb-4">
          <IconText icon={FiEdit2}>Edit Event</IconText>
        </h1>

        <p className="opacity-75">
          <IconText icon={FiLoader}>Cargando…</IconText>
        </p>
      </PageLayout>
    );
  }

  // ERROR + no event
  if (!event) {
    return (
      <PageLayout>
        <Link to="/my-events" className="btn btn-ghost btn-sm mb-4">
          <IconText icon={FiArrowLeft}>Volver</IconText>
        </Link>

        <div className="card bg-base-100 border rounded-2xl">
          <div className="card-body">
            <h1 className="text-3xl font-black mb-2">
              <IconText icon={FiAlertTriangle}>No se pudo cargar</IconText>
            </h1>

            <p className="text-error">{error || "No encontré el evento."}</p>

            <div className="card-actions mt-2">
              <button type="button" onClick={fetchEvent} className="btn btn-outline">
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // NOT OWNER (guard rail visual)
  if (hasToken && !isOwner) {
    return (
      <PageLayout>
        <Link to={`/events/${eventId}`} className="btn btn-ghost btn-sm mb-4">
          <IconText icon={FiArrowLeft}>Volver</IconText>
        </Link>

        <div className="card bg-base-100 border rounded-2xl">
          <div className="card-body">
            <h1 className="text-3xl font-black mb-2">
              <IconText icon={FiLock}>Sin permisos</IconText>
            </h1>

            <p className="opacity-80">
              Este evento no es tuyo, así que no puedes editarlo.
            </p>

            <div className="card-actions mt-2">
              <Link to={`/events/${eventId}`} className="btn btn-outline">
                <IconText icon={FiArrowLeft}>Volver al detalle</IconText>
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // FORM
  return (
    <PageLayout>
      <Link to={`/events/${eventId}`} className="btn btn-ghost btn-sm mb-4">
        <IconText icon={FiArrowLeft}>Volver</IconText>
      </Link>

      <header className="mb-6">
        <h1 className="text-4xl font-black">
          <IconText icon={FiEdit2}>Edit Event</IconText>
        </h1>
        <p className="opacity-70 mt-2">Actualiza tu evento y guarda cambios</p>
      </header>

      <section className="card bg-base-100 border rounded-2xl">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <label className="form-control">
              <div className="label">
                <span className="label-text font-extrabold">
                  <IconText icon={FiType}>Title</IconText>
                </span>
              </div>
              <input
                className="input input-bordered w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Ocean Meetup"
                disabled={isSaving}
                autoComplete="off"
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text font-extrabold">
                  <IconText icon={FiFileText}>Description</IconText>
                </span>
              </div>
              <textarea
                className="textarea textarea-bordered w-full"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Cuéntanos de qué va el evento"
                rows={4}
                disabled={isSaving}
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="form-control">
                <div className="label">
                  <span className="label-text font-extrabold">
                    <IconText icon={FiCalendar}>Date</IconText>
                  </span>
                </div>
                <input
                  type="datetime-local"
                  className="input input-bordered w-full"
                  value={dateLocal}
                  onChange={(e) => setDateLocal(e.target.value)}
                  disabled={isSaving}
                />
              </label>

              <label className="form-control">
                <div className="label">
                  <span className="label-text font-extrabold">
                    <IconText icon={FiMapPin}>Location</IconText>
                  </span>
                </div>
                <input
                  className="input input-bordered w-full"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej: Madrid"
                  disabled={isSaving}
                  autoComplete="off"
                />
              </label>
            </div>

            <label className="p-4 border rounded-xl bg-base-200/40">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-extrabold">Public event</div>
                  <div className="opacity-75 text-sm">
                    {isPublic ? "Visible para todos" : "Solo tú lo ves"}
                  </div>
                </div>

                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  disabled={isSaving}
                />
              </div>
            </label>

            {error && (
              <div className="alert alert-error">
                <IconText icon={FiAlertTriangle}>{error}</IconText>
              </div>
            )}

            <button type="submit" disabled={isSaving} className="btn btn-primary w-fit">
              <IconText icon={FiSave}>
                {isSaving ? "Guardando…" : "Save changes"}
              </IconText>
            </button>
          </form>
        </div>
      </section>
    </PageLayout>
  );
}
