import axios from "axios";

// Creates a reusable Axios instance for communicating with the backend API.
const api = axios.create({
  baseURL: "http://localhost:5001/api",
});

// Automatically attach the JWT to every outgoing API request.
// This allows protected backend endpoints to identify the authenticated user.
api.interceptors.request.use((config) => {
  // Retrieve the authentication token from browser storage.
  const token = localStorage.getItem("token");

  // Add the JWT to the Authorization header when a valid token is available.
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Return the modified request configuration to Axios.
  return config;
});

// Export the configured Axios instance for use throughout the application.
export default api;
