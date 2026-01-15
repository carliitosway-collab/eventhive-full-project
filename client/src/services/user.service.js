import api from "./api.service";

const userService = {
  getFavorites: () => api.get("/me/favorites"),
  addFavorite: (eventId) => api.post(`/me/favorites/${eventId}`),
  removeFavorite: (eventId) => api.delete(`/me/favorites/${eventId}`),
};

export default userService;
