import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import {
  FiArrowLeft,
  FiAlertTriangle,
  FiCalendar,
  FiMapPin,
  FiImage,
  FiTag,
  FiPlus,
} from "react-icons/fi";

import eventsService from "../services/events.service";
import { getNiceHttpError } from "../utils/httpErrors";
import PageLayout from "../layouts/PageLayout";
import IconText from "../components/IconText";

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

function nowAsMinDateTimeLocal() {
  return toDateTimeLocalValue(new Date().toISOString());
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

export default function NewEventPage() {
  const navigate = useNavigate();
  const routerLocation = useLocation();

  const fromState = routerLocation.state?.from || "";

  useEffect(() => {
    if (fromState) sessionStorage.setItem("newEventFrom", fromState);
  }, [fromState]);

  const backTo =
    fromState || sessionStorage.getItem("newEventFrom") || "/events";

  const token = localStorage.getItem("authToken");
  const hasToken = !!token;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateLocal, setDateLocal] = useState("");
  const [location, setLocation] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const [category, setCategory] = useState("Other");
  const [imageUrl, setImageUrl] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!hasToken) navigate("/login");
  }, [hasToken, navigate]);

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

  const PILL_CREATE =
    "inline-flex items-center gap-2 rounded-full bg-indigo-600 text-white px-2 py-2 text-sm font-medium shadow-md hover:bg-indigo-700 transition active:scale-[0.98]";

  const cleanPreviewUrl = useMemo(() => imageUrl.trim(), [imageUrl]);
  const showPreview = !!cleanPreviewUrl && looksLikeUrl(cleanPreviewUrl);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!hasToken) {
      setError("You must be logged in to create events.");
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

    const payload = {
      title: cleanTitle,
      description: cleanDesc,
      location: cleanLoc,
      date: isoDate,
      isPublic,
      category: normalizeCategory(category),
      imageUrl: cleanImage,
    };

    setIsSaving(true);

    eventsService
      .createEvent(payload)
      .then((res) => {
        const created = res.data?.data ?? res.data;
        const createdId = created?._id;
        if (createdId) navigate(`/events/${createdId}`);
        else navigate("/my-events");
      })
      .catch((err) =>
        setError(getNiceHttpError(err, "Could not create the event.")),
      )
      .finally(() => setIsSaving(false));
  };

  return (
    <PageLayout>
      <header className="sticky top-0 z-30 bg-indigo-50/90 backdrop-blur-md border-0 shadow-none py-2">
        <div
          className={`text-center max-w-lg mx-auto transition-all duration-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
          }`}
        >
          <h1 className="text-3xl md:text-4xl font-black leading-tight">
            Create Event
          </h1>

          <p className="opacity-70 mt-1 text-sm">
            Create a public or private event.
          </p>
        </div>

        <div className="max-w-lg mx-auto mt-2 flex justify-between items-center px-0">
          <Link to={backTo} className={PILL_BACK}>
            <FiArrowLeft />
            Back
          </Link>
        </div>
      </header>

      <section className="card rounded-3xl border border-indigo-200/70 bg-indigo-50/50 shadow-md max-w-lg mx-auto">
        <div className="card-body gap-6 p-7 md:p-8">
          <form
            id="new-event-form"
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
                        min={nowAsMinDateTimeLocal()}
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

                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`${PILL_CREATE} ${isSaving ? PILL_DISABLED : ""}`}
                  >
                    {isSaving ? "Creating…" : "Create"}
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
