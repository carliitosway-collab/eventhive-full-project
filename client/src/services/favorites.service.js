import api from "./api.service";

const favoritesService = {
  getMyFavorites: () => api.get("/users/me/favorites"),
  addFavorite: (eventId) => api.post(`/users/me/favorites/${eventId}`),
  removeFavorite: (eventId) => api.delete(`/users/me/favorites/${eventId}`),
};

export default favoritesService;
