import api from "./api.service";

const authService = {
  signup: (requestBody) => api.post("/auth/signup", requestBody),
  login: (requestBody) => api.post("/auth/login", requestBody),
  verify: () => api.get("/auth/verify"),
};

export default authService;
