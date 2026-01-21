export function isValidObjectId(id) {
  return typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);
}

export function extractFirstObjectId(value) {
  if (typeof value !== "string") return "";
  const match = value.match(/[a-fA-F0-9]{24}/);
  return match ? match[0] : "";
}
