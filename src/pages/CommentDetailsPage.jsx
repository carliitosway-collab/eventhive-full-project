import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiLoader,
  FiAlertTriangle,
  FiMessageCircle,
  FiCalendar,
  FiEye,
} from "react-icons/fi";

import commentsService from "../services/comments.service";
import PageLayout from "../layouts/PageLayout";
import IconText from "../components/IconText";

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

/* ✅ Pills globales (consistencia EventHive) */
const PILL_STATIC =
  "inline-flex items-center gap-2 rounded-full border border-base-300 px-4 py-1.5 text-sm font-medium shadow-sm";
const PILL_BTN =
  "inline-flex items-center gap-2 rounded-full border border-base-300 px-4 py-1.5 text-sm font-medium shadow-sm hover:bg-base-200 transition active:scale-[0.98]";

const PILL_INDIGO_STATIC = `${PILL_STATIC} border-indigo-200 bg-indigo-50 text-indigo-700`;
const PILL_INDIGO_BTN = `${PILL_BTN} border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100`;

export default function CommentDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const KEY = "eh:lastFrom";
  useEffect(() => {
    const from = location.state?.from;
    if (typeof from === "string" && from.trim()) {
      sessionStorage.setItem(KEY, from);
    }
  }, [location.state]);

  const eventIdFromQuery = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    const v = sp.get("eventId");
    return extractObjectId(v);
  }, [location.search]);

  const backTo =
    location.state?.from ||
    sessionStorage.getItem(KEY) ||
    (eventIdFromQuery ? `/events/${eventIdFromQuery}` : "/events");

  const rawCommentId = params?.commentId || "";
  const cleanCommentId = useMemo(
    () => extractObjectId(rawCommentId),
    [rawCommentId],
  );

  const stateComment = location.state?.comment || null;

  const [comment, setComment] = useState(stateComment);
  const [isLoading, setIsLoading] = useState(!stateComment);
  const [error, setError] = useState("");

  useEffect(() => {
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
      <div className="mx-auto w-full max-w-5xl">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4">
          <Link
            to={backTo}
            className={`${PILL_INDIGO_BTN} bg-indigo-50/60 border-2 border-indigo-200`}
          >
            <FiArrowLeft className="opacity-80" />
            Back
          </Link>

          {eventIdFromComment ? (
            <Link
              to={`/events/${eventIdFromComment}`}
              className={PILL_INDIGO_BTN}
            >
              <FiEye className="opacity-80" />
              View event
            </Link>
          ) : null}
        </div>

        {/* Header */}
        <header className="mt-6 mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black">Comment Details</h1>
          <p className="opacity-70 mt-3 max-w-2xl mx-auto">
            Single comment view
          </p>
        </header>

        {/* Body */}
        {isLoading ? (
          <div className="max-w-lg mx-auto">
            <p className="opacity-75 inline-flex items-center gap-2">
              <FiLoader className="animate-spin" />
              Loading…
            </p>
          </div>
        ) : error ? (
          <div className="max-w-lg mx-auto">
            <div className="alert alert-error">
              <IconText icon={FiAlertTriangle}>{error}</IconText>
            </div>
          </div>
        ) : !comment?._id ? (
          <p className="opacity-70 text-center">Comment not found.</p>
        ) : (
          <div className="card bg-indigo-50/60 border-2 border-indigo-200 rounded-2xl shadow-sm max-w-3xl mx-auto">
            <div className="card-body gap-5 p-6 md:p-7">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-extrabold inline-flex items-center gap-2">
                  <FiMessageCircle />
                  Comment
                </h2>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  {/* avatar */}
                  <div className="w-10 h-10 rounded-full border-2 border-indigo-200 bg-indigo-50 text-indigo-700 flex items-center justify-center font-black uppercase shrink-0">
                    {(comment?.author?.name || comment?.author?.email || "U")
                      .trim()
                      .charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      {authorIdFromComment ? (
                        <Link
                          to={`/users/${authorIdFromComment}`}
                          className="font-bold truncate hover:underline"
                          title={
                            comment?.author?.name ||
                            comment?.author?.email ||
                            "User"
                          }
                        >
                          {comment?.author?.name ||
                            comment?.author?.email ||
                            "User"}
                        </Link>
                      ) : (
                        <span className="font-bold truncate">
                          {comment?.author?.name ||
                            comment?.author?.email ||
                            "User"}
                        </span>
                      )}

                      {comment?.createdAt ? (
                        <span className="opacity-60 inline-flex items-center gap-2 whitespace-nowrap">
                          <FiCalendar className="opacity-70" />
                          {timeAgo(comment.createdAt)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <p className="leading-relaxed opacity-85 whitespace-pre-wrap">
                {comment?.text || ""}
              </p>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
