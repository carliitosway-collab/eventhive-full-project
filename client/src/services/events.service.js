import api from "./api.service";

const eventsService = {
  // ✅ Público
  getPublicEvents: (params = {}) =>
    api.get("/events", { params, requiresAuth: false }),

  // ✅ Detalle (asumimos público; si tu backend lo protege para privados, ya lo veremos luego)
  getEventDetails: (eventId) =>
    api.get(`/events/${eventId}`, { requiresAuth: false }),

  // 🔒 Privados
  createEvent: (payload) =>
    api.post("/events", payload, { requiresAuth: true }),

  updateEvent: (eventId, payload) =>
    api.put(`/events/${eventId}`, payload, { requiresAuth: true }),

  deleteEvent: (eventId) =>
    api.delete(`/events/${eventId}`, { requiresAuth: true }),

  joinEvent: (eventId) =>
    api.post(`/events/${eventId}/join`, null, { requiresAuth: true }),

  leaveEvent: (eventId) =>
    api.delete(`/events/${eventId}/join`, { requiresAuth: true }),

  getMyEvents: () =>
    api.get("/events", { params: { mine: true }, requiresAuth: true }),

  getAttendingEvents: () =>
    api.get("/events", { params: { attending: true }, requiresAuth: true }),
};

export default eventsService;
