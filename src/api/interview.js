import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://vidya-mitra-career-devlopment-platform-n7xw.onrender.com/api";

/**
 * Start an interview session
 */
export async function startInterview(role, userId = null) {
  try {
    const response = await axios.post(`${API_BASE}/interview/start`, {
      role,
      userId
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to start interview");
    }
    
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.detail || error.response?.data?.error || error.message || "Failed to start interview";
    throw new Error(message);
  }
}

/**
 * Get interview questions
 */
export async function fetchInterviewQuestions(role) {
  try {
    console.log('🎭 API: Fetching interview questions for role:', role);
    const response = await axios.get(`${API_BASE}/interview/questions/${encodeURIComponent(role)}`);
    
    console.log('🎭 API: Response status:', response.status);
    console.log('🎭 API: Response data:', response.data);
    
    if (!response.data.success) {
      console.error('🎭 API: Success is false');
      throw new Error(response.data.error || "Failed to fetch interview questions");
    }
    
    const questions = response.data.data.questions;
    console.log('🎭 API: Questions extracted:', questions.length);
    return questions;
  } catch (error) {
    console.error('🎭 API: Error occurred:', error);
    const message = error.response?.data?.detail || error.response?.data?.error || error.message || "Failed to fetch interview questions";
    console.error('🎭 API: Error message:', message);
    throw new Error(message);
  }
}

/**
 * Evaluate interview answers using AI
 */
export async function evaluateInterview(sessionId, role, questions, answers, userId = null) {
  try {
    const response = await axios.post(`${API_BASE}/interview/evaluate`, {
      sessionId,
      role,
      questions,
      answers,
      userId
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to evaluate interview");
    }
    
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.detail || error.response?.data?.error || error.message || "Failed to evaluate interview";
    throw new Error(message);
  }
}

/**
 * Submit interview answers (backward compatibility)
 */
export async function submitInterviewAnswers(userId, role, answers) {
  const response = await axios.post(`${API_BASE}/interview/feedback`, {
    userId,
    role,
    answers
  });
  
  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to submit interview answers");
  }
  
  return response.data.data;
}

export default {
  startInterview,
  fetchInterviewQuestions,
  evaluateInterview,
  submitInterviewAnswers
};

