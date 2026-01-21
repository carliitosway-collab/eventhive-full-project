import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiAlertTriangle, FiLoader, FiUser } from "react-icons/fi";

import PageLayout from "../layouts/PageLayout";
import userService from "../services/user.service";

function IconText({ icon: Icon, children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Icon />
      {children}
    </span>
  );
}

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

export default function UserDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();

  const rawUserId = params?.userId || "";
  const cleanUserId = useMemo(() => extractObjectId(rawUserId), [rawUserId]);

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const PILL_BTN =
    "inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-4 py-1.5 text-sm font-medium shadow-sm transition hover:bg-base-200 hover:shadow-md active:scale-[0.98]";

  useEffect(() => {
    // limpiar URL sucia
    if (rawUserId && cleanUserId && rawUserId !== cleanUserId) {
      navigate(`/users/${cleanUserId}`, { replace: true });
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
        console.log(err);
        setError(getNiceError(err));
      })
      .finally(() => setIsLoading(false));
  }, [rawUserId, cleanUserId, navigate]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            className={PILL_BTN}
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft />
            Back
          </button>
        </div>

        <header className="mt-4 mb-6">
          <h1 className="text-4xl md:text-5xl font-black">User Details</h1>
          <p className="opacity-70 mt-2">Loading profile…</p>
        </header>

        <p className="opacity-75">
          <IconText icon={FiLoader}>Loading…</IconText>
        </p>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            className={PILL_BTN}
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft />
            Back
          </button>
        </div>

        <header className="mt-4 mb-6">
          <h1 className="text-4xl md:text-5xl font-black">User Details</h1>
          <p className="opacity-70 mt-2">Profile preview</p>
        </header>

        <div className="alert alert-error">
          <IconText icon={FiAlertTriangle}>{error}</IconText>
        </div>
      </PageLayout>
    );
  }

  if (!user?._id) {
    return (
      <PageLayout>
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            className={PILL_BTN}
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft />
            Back
          </button>
        </div>

        <header className="mt-4 mb-6">
          <h1 className="text-4xl md:text-5xl font-black">User Details</h1>
          <p className="opacity-70 mt-2">Profile preview</p>
        </header>

        <p className="opacity-75">User not found.</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="flex items-center justify-between gap-4">
        <button type="button" className={PILL_BTN} onClick={() => navigate(-1)}>
          <FiArrowLeft />
          Back
        </button>

        <Link to="/me" className={PILL_BTN}>
          <FiUser />
          My profile
        </Link>
      </div>

      <header className="mt-4 mb-6">
        <h1 className="text-4xl md:text-5xl font-black">User Details</h1>
        <p className="opacity-70 mt-2">Profile preview</p>
      </header>

      <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm">
        <div className="card-body gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-outline border-base-300">
              ID: {user._id}
            </span>
          </div>

          <div className="grid gap-2">
            <div className="text-sm opacity-70">Name</div>
            <div className="text-lg font-bold">{user.name || "—"}</div>
          </div>

          <div className="grid gap-2">
            <div className="text-sm opacity-70">Email</div>
            <div className="text-base">{user.email || "—"}</div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
