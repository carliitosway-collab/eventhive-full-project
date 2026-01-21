import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiLoader,
  FiAlertTriangle,
  FiMessageCircle,
  FiCalendar,
} from "react-icons/fi";

import commentsService from "../services/comments.service";
import PageLayout from "../layouts/PageLayout";

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
  if (status === 403) return "You don’t have permission to view this comment.";
  if (status === 404) return "Comment not found.";
  if (!err?.response) return "No connection or the server is not responding.";

  return err?.response?.data?.message || "Something went wrong.";
}

function timeAgo(dateValue) {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d`;
  const diffW = Math.floor(diffD / 7);
  if (diffW < 4) return `${diffW}w`;
  const diffM = Math.floor(diffD / 30);
  if (diffM < 12) return `${diffM}mo`;
  const diffY = Math.floor(diffD / 365);
  return `${diffY}y`;
}

export default function CommentDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const rawCommentId = params?.commentId || "";
  const cleanCommentId = useMemo(
    () => extractObjectId(rawCommentId),
    [rawCommentId],
  );

  const stateComment = location.state?.comment || null;

  const [comment, setComment] = useState(stateComment);
  const [isLoading, setIsLoading] = useState(!stateComment);
  const [error, setError] = useState("");

  const PILL_BTN =
    "inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-4 py-1.5 text-sm font-medium shadow-sm transition hover:bg-base-200 hover:shadow-md active:scale-[0.98]";

  useEffect(() => {
    // ✅ si alguien entra con URL sucia, la limpiamos y reemplazamos
    if (rawCommentId && cleanCommentId && rawCommentId !== cleanCommentId) {
      navigate(`/comments/${cleanCommentId}`, {
        replace: true,
        state: location.state,
      });
      return;
    }

    if (comment) return;

    if (!cleanCommentId) {
      setIsLoading(false);
      setError("Invalid commentId");
      return;
    }

    setIsLoading(true);
    setError("");

    commentsService
      .getCommentDetails(cleanCommentId)
      .then((c) => setComment(c))
      .catch((err) => {
        console.log(err);
        setError(getNiceError(err));
      })
      .finally(() => setIsLoading(false));
  }, [rawCommentId, cleanCommentId, navigate, location.state, comment]);

  const eventIdFromComment = useMemo(() => {
    const ev = comment?.event;
    if (!ev) return "";
    if (typeof ev === "string") return extractObjectId(ev);
    return extractObjectId(ev?._id);
  }, [comment]);

  const authorIdFromComment = useMemo(() => {
    const a = comment?.author;
    if (!a) return "";
    if (typeof a === "string") return extractObjectId(a);
    return extractObjectId(a?._id);
  }, [comment]);

  return (
    <PageLayout>
      <div className="flex items-center justify-between gap-4">
        <button type="button" className={PILL_BTN} onClick={() => navigate(-1)}>
          <FiArrowLeft />
          Back
        </button>

        {eventIdFromComment && (
          <Link to={`/events/${eventIdFromComment}`} className={PILL_BTN}>
            View event
          </Link>
        )}
      </div>

      <header className="mt-4 mb-6">
        <h1 className="text-4xl md:text-5xl font-black">Comment Details</h1>
        <p className="opacity-70 mt-2">Single comment view</p>
      </header>

      {isLoading ? (
        <p className="opacity-75">
          <IconText icon={FiLoader}>Loading…</IconText>
        </p>
      ) : error ? (
        <div className="alert alert-error">
          <IconText icon={FiAlertTriangle}>{error}</IconText>
        </div>
      ) : !comment?._id ? (
        <p className="opacity-70">Comment not found.</p>
      ) : (
        <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm">
          <div className="card-body gap-4">
            <h2 className="text-lg font-extrabold inline-flex items-center gap-2">
              <FiMessageCircle />
              Comment
            </h2>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                {authorIdFromComment ? (
                  <Link
                    to={`/users/${authorIdFromComment}`}
                    className="font-semibold truncate hover:underline"
                  >
                    {comment?.author?.name || comment?.author?.email || "User"}
                  </Link>
                ) : (
                  <div className="font-semibold truncate">
                    {comment?.author?.name || comment?.author?.email || "User"}
                  </div>
                )}

                {comment?.createdAt && (
                  <div className="opacity-60 inline-flex items-center gap-2 mt-1">
                    <FiCalendar />
                    {timeAgo(comment.createdAt)}
                  </div>
                )}
              </div>

              <span className="badge badge-outline border-base-300">
                ID: {comment._id}
              </span>
            </div>

            <p className="text-sm leading-relaxed opacity-85 whitespace-pre-wrap">
              {comment?.text || ""}
            </p>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
