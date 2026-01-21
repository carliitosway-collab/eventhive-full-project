import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiAlertTriangle,
  FiPlus,
  FiCalendar,
  FiMapPin,
  FiType,
  FiFileText,
  FiImage,
  FiTag,
} from "react-icons/fi";

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

const CATEGORY_OPTIONS = [
  "Tech",
  "Music",
  "Sports",
  "Food",
  "Networking",
  "Art",
  "Gaming",
  "Education",
  "Business",
  "Other",
];

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

function looksLikeUrl(value) {
  if (!value) return true;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeCategory(value) {
  const clean = typeof value === "string" ? value.trim() : "";
  return CATEGORY_OPTIONS.includes(clean) ? clean : "Other";
}

export default function NewEventPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const [category, setCategory] = useState("Other");
  const [imageUrl, setImageUrl] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const PILL_BTN =
    "inline-flex items-center gap-2 rounded-full border border-base-300 px-3 py-1 text-sm font-medium shadow-sm hover:bg-base-200 transition active:scale-[0.98]";
  const PILL_DISABLED = "opacity-60 cursor-not-allowed";

  const cleanPreviewUrl = useMemo(() => imageUrl.trim(), [imageUrl]);
  const showPreview = !!cleanPreviewUrl && looksLikeUrl(cleanPreviewUrl);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const cleanTitle = title.trim();
    const cleanDesc = description.trim();
    const cleanLoc = location.trim();
    const cleanImage = imageUrl.trim();

    if (!cleanTitle || !cleanDesc || !date || !cleanLoc) {
      setError("Please complete title, description, date and location.");
      return;
    }

    if (!isValidDateTimeLocal(date)) {
      setError("Invalid date. Please use the date and time picker.");
      return;
    }

    if (!looksLikeUrl(cleanImage)) {
      setError("Image URL must be a valid http/https URL (or leave it empty).");
      return;
    }

    const isoDate = new Date(date).toISOString();

    const payload = {
      title: cleanTitle,
      description: cleanDesc,
      date: isoDate,
      location: cleanLoc,
      isPublic,
      category: normalizeCategory(category),
      imageUrl: cleanImage,
    };

    setIsLoading(true);

    eventsService
      .createEvent(payload)
      .then((res) => {
        const created = res.data?.data || res.data;
        const createdId = created?._id;

        if (createdId) navigate(`/events/${createdId}`);
        else navigate("/my-events");
      })
      .catch((err) => {
        setError(getNiceHttpError(err, "Could not create the event."));
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <PageLayout>
      <header className="mt-4 mb-6 px-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black">Create Event</h1>
          <p className="opacity-70 mt-2">Create a public or private event.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/events" className={PILL_BTN}>
            <FiArrowLeft />
            Back
          </Link>

          <button
            type="submit"
            form="new-event-form"
            disabled={isLoading}
            className={`${PILL_BTN} ${isLoading ? PILL_DISABLED : ""}`}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                Creating…
              </>
            ) : (
              <>
                <FiPlus />
                Create
              </>
            )}
          </button>
        </div>
      </header>

      <section className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm">
        <div className="card-body gap-6">
          <form
            id="new-event-form"
            onSubmit={handleSubmit}
            className="grid gap-6"
            noValidate
          >
            <div className="grid gap-1">
              <label className="form-control">
                <span className="label-text font-semibold">
                  <IconText icon={FiType}>Title</IconText>
                </span>

                <div className="rounded-xl border border-base-300 bg-base-100 px-3 py-2">
                  <input
                    className="w-full border-0 bg-transparent p-0 text-base focus:outline-none"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Ocean Meetup"
                    disabled={isLoading}
                    autoComplete="off"
                  />
                </div>
              </label>

              <label className="form-control">
                <span className="label-text font-semibold">
                  <IconText icon={FiFileText}>Description</IconText>
                </span>

                <div className="rounded-xl border border-base-300 bg-base-100 p-2.5 transition focus-within:border-primary">
                  <textarea
                    className="w-full resize-none border-0 bg-transparent p-0 text-base leading-relaxed focus:outline-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell people what this event is about"
                    rows={3}
                    disabled={isLoading}
                  />
                </div>
              </label>
            </div>

            <div className="border-t border-base-200 pt-6" />

            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="form-control">
                  <div className="label py-1">
                    <span className="label-text font-semibold">
                      <IconText icon={FiCalendar}>Date</IconText>
                    </span>
                  </div>

                  <div className="rounded-xl border border-base-300 bg-base-100 p-2.5 transition focus-within:border-primary">
                    <input
                      type="datetime-local"
                      className="w-full border-0 bg-transparent p-0 text-base focus:outline-none"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      disabled={isLoading}
                      min={nowAsMinDateTimeLocal()}
                    />
                  </div>
                </label>

                <label className="form-control">
                  <div className="label py-1">
                    <span className="label-text font-semibold">
                      <IconText icon={FiMapPin}>Location</IconText>
                    </span>
                  </div>

                  <div className="rounded-xl border border-base-300 bg-base-100 p-2.5 transition focus-within:border-primary">
                    <input
                      className="w-full border-0 bg-transparent p-0 text-base focus:outline-none"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Madrid"
                      disabled={isLoading}
                      autoComplete="off"
                    />
                  </div>
                </label>

                <label className="form-control">
                  <div className="label py-1">
                    <span className="label-text font-semibold">
                      <IconText icon={FiTag}>Category</IconText>
                    </span>
                  </div>

                  <div className="rounded-xl border border-base-300 bg-base-100 p-2.5 transition focus-within:border-primary">
                    <select
                      className="w-full border-0 bg-transparent p-0 text-base focus:outline-none"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={isLoading}
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>

                <label className="form-control">
                  <div className="label py-1">
                    <span className="label-text font-semibold">
                      <IconText icon={FiImage}>Image URL</IconText>
                    </span>
                  </div>

                  <div className="rounded-xl border border-base-300 bg-base-100 p-2.5 transition focus-within:border-primary">
                    <input
                      className="w-full border-0 bg-transparent p-0 text-base focus:outline-none"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Paste an image URL (optional)"
                      disabled={isLoading}
                      autoComplete="off"
                    />
                  </div>
                </label>
              </div>

              {showPreview && (
                <div className="border border-base-300 rounded-2xl overflow-hidden bg-base-100">
                  <img
                    src={cleanPreviewUrl}
                    alt="Event preview"
                    className="w-full h-56 object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3 rounded-xl border border-base-300 bg-base-100 px-3 py-2 shadow-sm">
                  <input
                    type="checkbox"
                    className="toggle bg-neutral checked:bg-neutral-content"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    disabled={isLoading}
                  />

                  <div className="grid">
                    <span className="font-semibold text-base-content">
                      {isPublic ? "Public event" : "Private event"}
                    </span>
                    <span className="text-sm text-base-content/80">
                      {isPublic
                        ? "Visible to everyone."
                        : "Only you can see it."}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                <IconText icon={FiAlertTriangle}>{error}</IconText>
              </div>
            )}
          </form>
        </div>
      </section>
    </PageLayout>
  );
}
