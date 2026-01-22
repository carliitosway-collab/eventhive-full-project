import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiLoader,
  FiAlertTriangle,
  FiCalendar,
  FiMapPin,
  FiLock,
  FiImage,
  FiTag,
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

function getNiceError(err) {
  const status = err?.response?.status;
  if (status === 401)
    return "Your session expired or you don’t have access. Please log in again.";
  if (status === 403) return "You don’t have permission to edit this event.";
  if (status === 404) return "Event not found.";
  if (!err?.response) return "No connection or the server is not responding.";
  return err?.response?.data?.message || "Something went wrong.";
}

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

function normalizeCategory(value) {
  const clean = typeof value === "string" ? value.trim() : "";
  return CATEGORY_OPTIONS.includes(clean) ? clean : "Other";
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

export default function EditEventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");
  const hasToken = !!token;

  const [event, setEvent] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateLocal, setDateLocal] = useState("");
  const [location, setLocation] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const [category, setCategory] = useState("Other");
  const [imageUrl, setImageUrl] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Consistencia: mismas pills indigo que en EventsList / Create
  const PILL_BTN =
    "inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 px-2.5 py-1 text-xs font-medium shadow-sm hover:bg-indigo-100 transition active:scale-[0.98]";

  const PILL_DISABLED = "opacity-60 cursor-not-allowed saturate-0";

  const FIELD_WRAP =
    "rounded-full border border-indigo-200/70 bg-base-100 h-8 px-3 flex items-center transition focus-within:border-indigo-300";

  const FIELD_INPUT =
    "w-full bg-transparent border-0 p-0 text-sm leading-none focus:outline-none";

  const AREA_WRAP =
    "rounded-2xl border border-indigo-200/70 bg-base-100 p-3 transition focus-within:border-indigo-300";
  const AREA_INPUT =
    "w-full resize-none bg-transparent border-0 p-0 text-sm leading-relaxed focus:outline-none";

  const PILL_BACK =
    "inline-flex items-center gap-1.5 rounded-full border border-indigo-300 bg-indigo-100 text-indigo-700 px-2 py-2 text-sm font-medium shadow-md hover:bg-indigo-200 transition active:scale-[0.98]";

  const PILL_SAVE =
    "inline-flex items-center rounded-full bg-indigo-600 text-white px-2 py-2 text-sm font-medium shadow-md hover:bg-indigo-700 transition active:scale-[0.98]";

  const userIdFromToken = useMemo(() => {
    if (!token) return null;
    try {
      const payloadBase64 = token.split(".")[1];
      const payloadJson = atob(
        payloadBase64.replace(/-/g, "+").replace(/_/g, "/"),
      );
      const payload = JSON.parse(payloadJson);
      return payload?._id || payload?.id || payload?.userId || null;
    } catch {
      return null;
    }
  }, [token]);

  const isOwner = useMemo(() => {
    if (!userIdFromToken || !event?.createdBy) return false;
    const ownerId =
      typeof event.createdBy === "string"
        ? event.createdBy
        : event.createdBy?._id;
    return String(ownerId) === String(userIdFromToken);
  }, [event, userIdFromToken]);

  const prefillForm = (eventData) => {
    setTitle(eventData?.title || "");
    setDescription(eventData?.description || "");
    setLocation(eventData?.location || "");
    setIsPublic(eventData?.isPublic ?? true);
    setDateLocal(toDateTimeLocalValue(eventData?.date));
    setCategory(normalizeCategory(eventData?.category));
    setImageUrl(
      typeof eventData?.imageUrl === "string" ? eventData.imageUrl : "",
    );
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
        setError(getNiceError(err));
        setEvent(null);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
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
      setError("You must be logged in to edit events.");
      return;
    }

    if (!isOwner) {
      setError("You don’t have permission to edit this event.");
      return;
    }

    const cleanTitle = title.trim();
    const cleanDesc = description.trim();
    const cleanLoc = location.trim();
    const cleanImage = imageUrl.trim();

    if (!cleanTitle || !cleanDesc || !cleanLoc || !dateLocal) {
      setError("Please fill in title, description, date and location.");
      return;
    }

    if (!looksLikeUrl(cleanImage)) {
      setError("Image URL must be a valid http/https URL (or leave it empty).");
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
        category: normalizeCategory(category),
        imageUrl: cleanImage,
      })
      .then(() => navigate(`/events/${eventId}`))
      .catch((err) => setError(getNiceError(err)))
      .finally(() => setIsSaving(false));
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-between gap-4">
          <Link to="/my-events" className={PILL_BTN}>
            <FiArrowLeft /> Back
          </Link>
        </div>

        <header className="mt-4 mb-3">
          <h1 className="text-3xl font-bold">Edit Event</h1>
          <p className="opacity-70 mt-2">Loading event details…</p>
        </header>

        <p className="opacity-75">
          <span className="inline-flex items-center gap-2">
            <FiLoader className="animate-spin" /> Loading…
          </span>
        </p>
      </PageLayout>
    );
  }

  if (!event) {
    return (
      <PageLayout>
        <div className="flex items-center justify-between gap-4">
          <Link to="/my-events" className={PILL_BTN}>
            <FiArrowLeft /> Back
          </Link>
        </div>

        <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm mt-6">
          <div className="card-body">
            <h1 className="text-3xl font-black mb-2">
              <IconText icon={FiAlertTriangle}>Could not load</IconText>
            </h1>
            <p className="text-error">{error || "Event not found."}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (hasToken && !isOwner) {
    return (
      <PageLayout>
        <div className="flex items-center justify-between gap-4">
          <Link to={`/events/${eventId}`} className={PILL_BTN}>
            <FiArrowLeft /> Back
          </Link>
        </div>

        <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm mt-6">
          <div className="card-body">
            <h1 className="text-3xl font-black mb-2">
              <IconText icon={FiLock}>No permission</IconText>
            </h1>

            <p className="opacity-80">
              This event isn’t yours, so you can’t edit it.
            </p>

            <div className="card-actions mt-2">
              <Link to={`/events/${eventId}`} className={PILL_BTN}>
                <FiArrowLeft /> Back to details
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  const cleanPreviewUrl = imageUrl.trim();
  const showPreview = !!cleanPreviewUrl && looksLikeUrl(cleanPreviewUrl);

  return (
    <PageLayout>
      <header className="sticky top-0 z-30 bg-indigo-50/90 backdrop-blur-md border-0 shadow-none py-2">
        <div
          className={`text-center max-w-lg mx-auto transition-all duration-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
          }`}
        >
          <h1 className="text-3xl md:text-4xl font-black leading-tight">
            Edit Event
          </h1>

          <p className="opacity-70 mt-1 text-sm">
            Update your event and save changes.
          </p>
        </div>

        <div className="max-w-lg mx-auto mt-2 flex justify-between items-center px-0">
          <Link to={`/events/${eventId}`} className={PILL_BACK}>
            <FiArrowLeft />
            Back
          </Link>
        </div>
      </header>

      <section className="card rounded-3xl border border-indigo-200/70 bg-indigo-50/50 shadow-md max-w-lg mx-auto">
        <div className="card-body gap-6 p-7 md:p-8">
          <form
            id="edit-event-form"
            onSubmit={handleSubmit}
            className="grid gap-6"
            noValidate
          >
            <div className="grid gap-1">
              <label className="form-control">
                <span className="label-text font-semibold">Title</span>

                <div className={`${FIELD_WRAP} w-full md:max-w-[420px]`}>
                  <input
                    className={FIELD_INPUT}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Ocean Meetup"
                    disabled={isSaving}
                    autoComplete="off"
                  />
                </div>
              </label>

              <label className="form-control">
                <span className="label-text font-semibold">Description</span>

                <div className={`${AREA_WRAP} w-full md:max-w-[420px]`}>
                  <textarea
                    className={AREA_INPUT}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell people what this event is about"
                    rows={3}
                    disabled={isSaving}
                  />
                </div>
              </label>
            </div>
            <div className="border-t border-indigo-200/50 pt-6" />
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-[max-content_max-content] gap-x-8 gap-y-3 justify-start">
                <label className="form-control">
                  <div className="label py-1">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <FiCalendar className="text-violet-600" />
                      Date
                    </span>
                  </div>
                  <div className="flex">
                    <div className={`${FIELD_WRAP} w-full md:max-w-[180px]`}>
                      <input
                        type="datetime-local"
                        className={FIELD_INPUT}
                        value={dateLocal}
                        onChange={(e) => setDateLocal(e.target.value)}
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                </label>

                <label className="form-control">
                  <div className="label py-1">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <FiMapPin className="text-red-500" />
                      Location
                    </span>
                  </div>
                  <div className="flex">
                    <div className={`${FIELD_WRAP} w-full md:max-w-[180px]`}>
                      <input
                        className={FIELD_INPUT}
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Madrid"
                        disabled={isSaving}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </label>

                <label className="form-control">
                  <div className="label py-1">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <FiTag className="text-amber-500" />
                      Category
                    </span>
                  </div>
                  <div className="flex">
                    <div className={`${FIELD_WRAP} w-full md:max-w-[180px]`}>
                      <select
                        className={`${FIELD_INPUT} appearance-none`}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={isSaving}
                      >
                        {CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </label>

                <label className="form-control">
                  <div className="label py-1">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <FiImage className="text-sky-500" />
                      Image URL
                    </span>
                  </div>
                  <div className="flex">
                    <div className={`${FIELD_WRAP} w-full md:max-w-[180px]`}>
                      <input
                        className={FIELD_INPUT}
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Paste an image URL (optional)"
                        disabled={isSaving}
                        autoComplete="off"
                      />
                    </div>
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
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-indigo-200/70 bg-indigo-50/60 px-3 py-2 shadow-sm">
                  {/* Toggle + text */}
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      className="toggle bg-neutral checked:bg-neutral-content"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      disabled={isSaving}
                    />

                    <div className="grid">
                      <span className="font-medium text-sm text-indigo-900">
                        {isPublic ? "Public event" : "Private event"}
                      </span>
                      <span className="text-xs text-indigo-700/80">
                        {isPublic
                          ? "Visible to everyone."
                          : "Only you can see it."}
                      </span>
                    </div>
                  </label>

                  {/* Save button */}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`${PILL_SAVE} ${isSaving ? PILL_DISABLED : ""}`}
                  >
                    {isSaving ? "Saving…" : "Save changes"}
                  </button>
                </div>
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
