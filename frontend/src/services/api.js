import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001", // productos-service
});

export default api;