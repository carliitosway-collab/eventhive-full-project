export function getUserIdFromToken(token) {
  if (!token) return null;
  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);
    return payload?._id || payload?.id || payload?.userId || null;
  } catch (e) {
    console.log("Token decode error:", e);
    return null;
  }
}

export function isOwnerOfEvent(event, userId) {
  if (!event || !userId || !event.createdBy) return false;

  const ownerId = typeof event.createdBy === "string" ? event.createdBy : event.createdBy?._id;
  return String(ownerId) === String(userId);
}
