import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

/**
 * Analyze resume using AI
 */
export async function analyzeResume(userId, text, fileName = null) {
  try {
    const response = await axios.post(`${API_BASE}/resume/analyze`, {
      userId,
      text,
      fileName
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to analyze resume");
    }
    
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.detail || error.response?.data?.error || error.message || "Failed to analyze resume";
    throw new Error(message);
  }
}

/**
 * Save resume text
 */
export async function saveResume(userId, text, fileName = null) {
  const response = await axios.post(`${API_BASE}/resume/save/${userId}`, {
    text,
    fileName
  });
  
  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to save resume");
  }
  
  return response.data;
}

/**
 * Get stored resume
 */
export async function getStoredResume(userId) {
  const response = await axios.get(`${API_BASE}/resume/${userId}`);
  return response.data;
}

export default {
  analyzeResume,
  saveResume,
  getStoredResume
};

