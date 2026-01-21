import api from "./api.service";

function normalizeUser(raw = {}) {
  return {
    _id: raw._id,
    name: raw.name ?? "",
    email: raw.email ?? "",
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

const userService = {
  // ✅ GET /api/users/:userId
  getUserDetails(userId) {
    return api.get(`/users/${userId}`).then((res) => {
      const payload = res.data?.data ?? res.data;
      const user = payload?.user ?? payload;
      return normalizeUser(user || {});
    });
  },

  // favorites (ya lo tenías)
  getFavorites: () => api.get("/users/me/favorites"),
  addFavorite: (eventId) => api.post(`/users/me/favorites/${eventId}`),
  removeFavorite: (eventId) => api.delete(`/users/me/favorites/${eventId}`),
};

export default userService;
