import api from "./api.service";

const eventsService = {
  // Público
  getPublicEvents: (params = {}) => api.get("/events", { params }),

  getEventDetails: (eventId) => api.get(`/events/${eventId}`),

  // Privados (requieren token -> interceptor lo añade)
  createEvent: (payload) => api.post("/events", payload),

  updateEvent: (eventId, payload) => api.put(`/events/${eventId}`, payload),

  deleteEvent: (eventId) => api.delete(`/events/${eventId}`),

  joinEvent: (eventId) => api.post(`/events/${eventId}/join`, null),

  leaveEvent: (eventId) => api.delete(`/events/${eventId}/join`),

  getMyEvents: () => api.get("/events", { params: { mine: true } }),

  getAttendingEvents: () => api.get("/events", { params: { attending: true } }),
};

export default eventsService;
