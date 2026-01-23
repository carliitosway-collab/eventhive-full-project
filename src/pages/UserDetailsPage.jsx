import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { FiArrowLeft, FiAlertTriangle, FiLoader, FiUser } from "react-icons/fi";

import PageLayout from "../layouts/PageLayout";
import userService from "../services/user.service";
import IconText from "../components/IconText";

function extractObjectId(value) {
  const s = String(value || "");
  const match = s.match(/[a-fA-F0-9]{24}/);
  return match ? match[0] : "";
}

function getNiceError(err) {
  const status = err?.response?.status;

  if (status === 401) return "Missing authorization token / session expired.";
  if (status === 403) return "You don’t have permission to view this user.";
  if (status === 404) return "User not found.";
  if (!err?.response) return "No connection or the server is not responding.";

  return err?.response?.data?.message || "Something went wrong.";
}

/* ✅ Pills consistentes con EventHive */
const PILL_BTN =
  "inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 shadow-sm hover:bg-indigo-100 transition active:scale-[0.98]";

export default function UserDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const rawUserId = params?.userId || "";
  const cleanUserId = useMemo(() => extractObjectId(rawUserId), [rawUserId]);

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const location = useLocation();
  const KEY = "eh:lastFrom";

  useEffect(() => {
    const from = location.state?.from;
    if (typeof from === "string" && from.trim()) {
      sessionStorage.setItem(KEY, from);
    }
  }, [location.state]);

  const backTo = location.state?.from || sessionStorage.getItem(KEY) || "/me";

  useEffect(() => {
    // limpiar URL sucia
    if (rawUserId && cleanUserId && rawUserId !== cleanUserId) {
      navigate(`/users/${cleanUserId}`, {
        replace: true,
        state: location.state,
      });
      return;
    }

    if (!cleanUserId) {
      setIsLoading(false);
      setError("Invalid userId");
      return;
    }

    setIsLoading(true);
    setError("");

    userService
      .getUserDetails(cleanUserId)
      .then((u) => setUser(u))
      .catch((err) => {
        setError(getNiceError(err));
      })
      .finally(() => setIsLoading(false));
  }, [rawUserId, cleanUserId, navigate, location.state]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="mx-auto w-full max-w-5xl flex items-center justify-between gap-4">
          <Link to={backTo} className={PILL_BTN}>
            <FiArrowLeft className="opacity-80" />
            Back
          </Link>
        </div>

        <header className="mt-6 mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black">User Details</h1>
          <p className="opacity-70 mt-3 max-w-2xl mx-auto">Loading profile…</p>
        </header>

        <div className="max-w-lg mx-auto">
          <p className="opacity-75 inline-flex items-center gap-2">
            <FiLoader className="animate-spin" />
            Loading…
          </p>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="mx-auto w-full max-w-5xl flex items-center justify-between gap-4">
          <button
            type="button"
            className={PILL_BTN}
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft className="opacity-80" />
            Back
          </button>
        </div>

        <header className="mt-6 mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black">User Details</h1>
          <p className="opacity-70 mt-3 max-w-2xl mx-auto">Profile preview</p>
        </header>

        <div className="max-w-lg mx-auto">
          <div className="alert alert-error">
            <IconText icon={FiAlertTriangle}>{error}</IconText>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!user?._id) {
    return (
      <PageLayout>
        <div className="mx-auto w-full max-w-5xl flex items-center justify-between gap-4">
          <Link to={backTo} className={PILL_BTN}>
            <FiArrowLeft className="opacity-80" />
            Back
          </Link>

          <Link to="/me" className={PILL_BTN}>
            <FiUser className="opacity-80" />
            My profile
          </Link>
        </div>

        <header className="mt-6 mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black">User Details</h1>
          <p className="opacity-70 mt-3 max-w-2xl mx-auto">Profile preview</p>
        </header>

        <p className="opacity-75 text-center">User not found.</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-5xl flex items-center justify-between gap-4">
        <Link to={backTo} className={PILL_BTN}>
          <FiArrowLeft className="opacity-80" />
          Back
        </Link>

        <Link to="/me" className={PILL_BTN}>
          <FiUser className="opacity-80" />
          My profile
        </Link>
      </div>

      <header className="mt-6 mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-black">User Details</h1>
        <p className="opacity-70 mt-3 max-w-2xl mx-auto">Profile preview</p>
      </header>

      <UserProfileCard user={user} />
    </PageLayout>
  );
}
