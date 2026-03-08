import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Resume Analysis API
export const resumeAPI = {
  analyze: (resumeData) => api.post('/resume/analyze', resumeData),
  getStored: () => api.get('/resume/stored'),
};

// Roles API
export const rolesAPI = {
  get: () => api.get('/roles'),
  getMatching: (resumeText) => api.post('/roles/matching', { resumeText }),
};

// Training API
export const trainingAPI = {
  generate: (roleData) => api.post('/training/generate', roleData),
  getPlan: (roleId) => api.get(`/training/plan/${roleId}`),
};

// Quiz API
export const quizAPI = {
  generate: (quizData) => api.post('/quiz/generate', quizData),
  submit: (quizData) => api.post('/quiz/submit', quizData),
  getResults: () => api.get('/quiz/results'),
};

// Interview API
export const interviewAPI = {
  start: (interviewData) => api.post('/interview/start', interviewData),
  evaluate: (answerData) => api.post('/interview/evaluate', answerData),
  getQuestions: (role) => api.get(`/interview/questions/${role}`),
};

// Progress API
export const progressAPI = {
  get: () => api.get('/progress'),
  update: (progressData) => api.put('/progress', progressData),
};

// AI Services API
export const aiAPI = {
  getProviders: () => api.get('/ai/providers'),
  analyzeResume: (data) => api.post('/ai/analyze-resume', data),
  generateQuestions: (data) => api.post('/ai/generate-questions', data),
  generateTraining: (data) => api.post('/ai/generate-training', data),
  getCareerNews: (role) => api.get(`/ai/career-news/${role}`),
  getCareerAdvice: (data) => api.post('/ai/career-advice', data),
  compareProviders: (data) => api.post('/ai/compare-providers', data),
};

export default api;
