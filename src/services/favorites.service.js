import api from "./api.service";

const favoritesService = {
  // ✅ GET /api/users/me/favorites
  getMyFavorites: () => api.get("/users/me/favorites"),

  // ✅ POST /api/users/me/favorites/:eventId
  addFavorite: (eventId) => api.post(`/users/me/favorites/${eventId}`),

  // ✅ DELETE /api/users/me/favorites/:eventId
  removeFavorite: (eventId) => api.delete(`/users/me/favorites/${eventId}`),
};

export default favoritesService;
