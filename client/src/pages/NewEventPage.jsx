import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiLoader,
  FiAlertTriangle,
  FiPlus,
  FiCalendar,
  FiMapPin,
  FiType,
  FiFileText,
} from "react-icons/fi";

import eventsService from "../services/events.service";
import { getNiceHttpError } from "../utils/httpErrors";

function IconText({ icon: Icon, children, className }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className || ""}`}>
      <Icon />
      {children}
    </span>
  );
}

function isValidDateTimeLocal(value) {
  if (!value) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

function nowAsMinDateTimeLocal() {
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
  const [date, setDate] = useState("");
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
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link to="/events" className="btn btn-ghost btn-sm">
        <IconText icon={FiArrowLeft}>Volver</IconText>
      </Link>

      <header className="mt-3 mb-5">
        <h1 className="text-4xl font-black">New Event</h1>
        <p className="opacity-70 mt-1">Crea un evento público o privado</p>
      </header>

      <section className="card bg-base-100 border rounded-2xl shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
            <label className="form-control">
              <div className="label">
                <span className="label-text font-bold">
                  <IconText icon={FiType}>Title</IconText>
                </span>
              </div>
              <input
                className="input input-bordered w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Ocean Meetup"
                disabled={isLoading}
                autoComplete="off"
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text font-bold">
                  <IconText icon={FiFileText}>Description</IconText>
                </span>
              </div>
              <textarea
                className="textarea textarea-bordered w-full"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Cuéntanos de qué va el evento"
                rows={4}
                disabled={isLoading}
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="form-control">
                <div className="label">
                  <span className="label-text font-bold">
                    <IconText icon={FiCalendar}>Date</IconText>
                  </span>
                </div>
                <input
                  type="datetime-local"
                  className="input input-bordered w-full"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={isLoading}
                  min={nowAsMinDateTimeLocal()}
                />
              </label>

              <label className="form-control">
                <div className="label">
                  <span className="label-text font-bold">
                    <IconText icon={FiMapPin}>Location</IconText>
                  </span>
                </div>
                <input
                  className="input input-bordered w-full"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej: Madrid"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  disabled={isLoading}
                />
                <div className="grid">
                  <span className="font-bold">{isPublic ? "Public event" : "Private event"}</span>
                  <span className="text-sm opacity-70">
                    {isPublic ? "Visible para todos" : "Solo tú podrás verlo"}
                  </span>
                </div>
              </label>
            </div>

            {error && (
              <div className="alert alert-error">
                <IconText icon={FiAlertTriangle}>{error}</IconText>
              </div>
            )}

            <button type="submit" disabled={isLoading} className="btn btn-primary w-fit">
              {isLoading ? (
                <IconText icon={FiLoader}>Creating…</IconText>
              ) : (
                <IconText icon={FiPlus}>Create Event</IconText>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
