import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

/**
 * Fetch user progress
 */
export async function fetchProgress(userId) {
  const response = await axios.get(`${API_BASE}/progress/${encodeURIComponent(userId)}`);
  return response.data;
}

/**
 * Mark roles as viewed
 */
export async function markRolesViewed(userId) {
  const response = await axios.post(`${API_BASE}/progress/roles-viewed`, {
    userId
  });
  return response.data;
}

export default {
  fetchProgress,
  markRolesViewed
};

