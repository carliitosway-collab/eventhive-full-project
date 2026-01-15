import api from "./api.service";

const eventsService = {
  // públicos
  getPublicEvents: (params) => api.get("/events", { params }),

  // detalle
  getEvent: (eventId) => api.get(`/events/${eventId}`),

  // mine / attending (lo que ya tienes en backend)
  getMyEvents: (params) => api.get("/events", { params: { ...params, mine: true } }),
  getAttendingEvents: (params) =>
    api.get("/events", { params: { ...params, attending: true } }),

  // crud
  createEvent: (body) => api.post("/events", body),
  updateEvent: (eventId, body) => api.put(`/events/${eventId}`, body),
  deleteEvent: (eventId) => api.delete(`/events/${eventId}`),
};

export default eventsService;
