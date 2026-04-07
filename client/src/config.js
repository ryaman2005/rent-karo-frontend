// Centralized API URL — reads from environment variable in production,
// falls back to localhost for local development.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
