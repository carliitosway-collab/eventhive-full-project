export function getNiceHttpError(err, fallbackMessage = "Ha ocurrido un error.") {
  const status = err?.response?.status;

  if (status === 401) return "Tu sesión expiró o no tienes acceso. Inicia sesión de nuevo.";
  if (status === 403) return "No tienes permisos para hacer esto.";
  if (status === 404) return "No encontré lo que buscas.";
  if (!err?.response) return "No hay conexión o el servidor no responde.";

  return err?.response?.data?.message || fallbackMessage;
}
