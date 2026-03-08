import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

/**
 * Generate quiz questions using AI
 */
export async function generateQuiz(role, userId = null) {
  const response = await axios.post(`${API_BASE}/quiz/generate`, {
    role,
    userId
  });
  
  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to generate quiz");
  }
  
  return response.data.data;
}

/**
 * Get quiz questions (backward compatibility)
 */
export async function fetchQuizQuestions(role) {
  const response = await axios.get(`${API_BASE}/quiz/${encodeURIComponent(role)}`);
  
  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch questions");
  }
  
  return response.data.data.questions;
}

/**
 * Evaluate quiz answers
 */
export async function evaluateQuiz(userId, role, answers) {
  const response = await axios.post(`${API_BASE}/quiz/evaluate`, {
    userId,
    role,
    answers
  });
  
  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to evaluate quiz");
  }
  
  return response.data.data;
}

/**
 * Submit quiz answers
 */
export async function submitQuizAnswers(userId, role, answers, score = null) {
  const response = await axios.post(`${API_BASE}/quiz/submit`, {
    userId,
    role,
    answers,
    score
  });
  
  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to submit quiz");
  }
  
  return response.data.data;
}

export default {
  generateQuiz,
  fetchQuizQuestions,
  evaluateQuiz,
  submitQuizAnswers
};

