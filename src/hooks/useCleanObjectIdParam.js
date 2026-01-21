import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { extractFirstObjectId, isValidObjectId } from "../utils/objectId";

export default function useCleanObjectIdParam({ paramName, basePath }) {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const raw = params?.[paramName];

  const cleanId = useMemo(() => {
    if (isValidObjectId(raw)) return raw;
    return extractFirstObjectId(raw);
  }, [raw]);

  const isValid = useMemo(() => isValidObjectId(cleanId), [cleanId]);

  useEffect(() => {
    if (!raw) return;

    // Si ya es limpio, no hacemos nada
    if (isValidObjectId(raw)) return;

    // Si podemos rescatar un ObjectId, reescribimos la URL con replace
    if (isValidObjectId(cleanId)) {
      const nextPath = `${basePath}/${cleanId}${location.search || ""}${location.hash || ""}`;
      navigate(nextPath, { replace: true });
    }
  }, [raw, cleanId, basePath, navigate, location.search, location.hash]);

  return { raw, id: cleanId, isValid };
}
