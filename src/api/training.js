import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

/**
 * Generate training plan using AI
 */
export async function generateTrainingPlan(role, userSkills = [], userId = null) {
  try {
    const response = await axios.post(`${API_BASE}/training/generate`, {
      role,
      userSkills,
      userId
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to generate training plan");
    }
    
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.detail || error.response?.data?.error || error.message || "Failed to generate training plan";
    throw new Error(message);
  }
}

/**
 * Get training plan (backward compatibility)
 */
export async function fetchTrainingPlan(userId, role) {
  try {
    // The backend expects role in the URL, userId as query param
    const url = userId 
      ? `${API_BASE}/training/${encodeURIComponent(role)}?userId=${userId}`
      : `${API_BASE}/training/${encodeURIComponent(role)}`;
    
    const response = await axios.get(url);
    
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to fetch training plan");
    }
    
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.detail || error.response?.data?.error || error.message || "Failed to fetch training plan";
    throw new Error(message);
  }
}

/**
 * Get recommended roles
 */
export async function getRecommendedRoles(skills) {
  const response = await axios.get(`${API_BASE}/roles?skills=${encodeURIComponent(skills)}`);
  return response.data;
}

export default {
  generateTrainingPlan,
  fetchTrainingPlan,
  getRecommendedRoles
};

