import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiLoader,
  FiAlertTriangle,
  FiCalendar,
  FiMapPin,
  FiType,
  FiFileText,
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

  const PILL_BTN =
    "inline-flex items-center gap-2 rounded-full border border-base-300 px-3 py-1 text-sm font-medium shadow-sm hover:bg-base-200 transition active:scale-[0.98]";
  const PILL_PRIMARY =
    "inline-flex items-center gap-2 rounded-full border border-primary px-3 py-1 text-sm font-semibold shadow-sm bg-primary text-primary-content hover:brightness-95 transition active:scale-[0.98]";
  const PILL_DISABLED = "opacity-60 cursor-not-allowed";
  const PILL_PRIMARY_SOFT =
    "inline-flex items-center gap-2 rounded-full border border-primary px-3 py-1 text-sm font-semibold text-primary bg-base-100 shadow-sm hover:bg-base-200 transition active:scale-[0.98]";

  const PILL_STATIC =
    "inline-flex items-center gap-2 rounded-full border border-base-300 px-3 py-1 text-sm font-medium shadow-sm";

  // unified “visible input” style
  const FIELD =
    "bg-base-100 border-base-300 focus:border-primary focus:outline-none";

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

        <header className="mt-4 mb-4">
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
      <header className="mt-4 mb-6 px-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black">Edit Event</h1>
          <p className="opacity-70 mt-2">Update your event and save changes.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link to={`/events/${eventId}`} className={PILL_BTN}>
            <FiArrowLeft />
            Back
          </Link>

          <button
            type="submit"
            form="edit-event-form"
            disabled={isSaving}
            className={`${PILL_BTN} ${isSaving ? PILL_DISABLED : ""}`}
          >
            {isSaving ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                Saving…
              </>
            ) : (
              <>Save changes</>
            )}
          </button>
        </div>
      </header>

      <section className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm">
        <div className="card-body gap-6">
          <form
            id="edit-event-form"
            onSubmit={handleSubmit}
            className="grid gap-6"
            noValidate
          >
            {/* Main info */}

            <div className="grid gap-1">
              {/* Title */}
              <label className="form-control">
                <span className="label-text font-semibold">Title</span>

                <div className="rounded-xl border border-base-300 bg-base-100 px-3 py-2">
                  <input
                    className="w-full border-0 bg-transparent p-0 text-base focus:outline-none"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Ocean Meetup"
                    disabled={isSaving}
                    autoComplete="off"
                  />
                </div>
              </label>

              {/* Description */}
              <label className="form-control">
                <span className="label-text font-semibold">Description</span>
                <div className="rounded-xl border border-base-300 bg-base-100 p-2.5 transition focus-within:border-primary">
                  <textarea
                    className="w-full resize-none border-0 bg-transparent p-0 text-base leading-relaxed focus:outline-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell people what this event is about"
                    rows={3}
                    disabled={isSaving}
                  />
                </div>
              </label>
            </div>
            <div className="border-t border-base-200 pt-6" />
            {/* Meta */}
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <label className="form-control">
                  <div className="label py-1">
                    <span className="label-text font-semibold">Date</span>
                  </div>

                  <div className="rounded-xl border border-base-300 bg-base-100 p-2.5 transition focus-within:border-primary">
                    <input
                      type="datetime-local"
                      className="w-full border-0 bg-transparent p-0 text-base focus:outline-none"
                      value={dateLocal}
                      onChange={(e) => setDateLocal(e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                </label>

                {/* Location */}
                <label className="form-control">
                  <div className="label py-1">
                    <span className="label-text font-semibold">Location</span>
                  </div>

                  <div className="rounded-xl border border-base-300 bg-base-100 p-2.5 transition focus-within:border-primary">
                    <input
                      className="w-full border-0 bg-transparent p-0 text-base focus:outline-none"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Madrid"
                      disabled={isSaving}
                      autoComplete="off"
                    />
                  </div>
                </label>

                {/* Category */}
                <label className="form-control">
                  <div className="label py-1">
                    <span className="label-text font-semibold">Category</span>
                  </div>

                  <div className="rounded-xl border border-base-300 bg-base-100 p-2.5 transition focus-within:border-primary">
                    <select
                      className="w-full border-0 bg-transparent p-0 text-base focus:outline-none"
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
                </label>

                {/* Image URL */}
                <label className="form-control">
                  <div className="label py-1">
                    <span className="label-text font-semibold">Image URL</span>
                  </div>

                  <div className="rounded-xl border border-base-300 bg-base-100 p-2.5 transition focus-within:border-primary">
                    <input
                      className="w-full border-0 bg-transparent p-0 text-base focus:outline-none"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Paste an image URL (optional)"
                      disabled={isSaving}
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

              {/* Public toggle (compact) */}
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3 rounded-xl border border-base-300 bg-base-100 px-3 py-2 shadow-sm">
                  <input
                    type="checkbox"
                    className="toggle bg-neutral checked:bg-neutral-content"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    disabled={isSaving}
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
