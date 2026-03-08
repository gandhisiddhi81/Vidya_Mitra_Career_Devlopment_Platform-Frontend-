import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import Loading from "../components/Loading";
import { analyzeResume, saveResume, getStoredResume } from "../api/resume";
import { fetchTrainingPlan } from "../api/training";
import { fetchInterviewQuestions, submitInterviewAnswers } from "../api/interview";
import { fetchProgress, markRolesViewed } from "../api/progress";
import { generateQuiz } from "../api/quiz";
import { 
  GlassCard, 
  GradientCard, 
  FeatureCard, 
  StatCard, 
  AnimatedButton, 
  ProgressRing,
  AnimatedBackground 
} from "../components/UIComponents";
import { VoiceRecorder, AudioPlayer } from "../components/VoiceRecorder";
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  BookOpenIcon, 
  UserGroupIcon,
  SparklesIcon,
  RocketLaunchIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

// Dynamic role list - will be populated from resume analysis
const DEFAULT_ROLES = [
  { id: "software-engineer", label: "Software Engineer", description: "Programming, algorithms, and system design" },
  { id: "frontend-developer", label: "Frontend Developer", description: "UI/UX, React, CSS, and web technologies" },
  { id: "backend-developer", label: "Backend Developer", description: "Server-side, databases, and APIs" },
  { id: "full-stack-developer", label: "Full-stack Developer", description: "End-to-end web development" },
  { id: "mobile-app-developer", label: "Mobile App Developer", description: "iOS, Android, and mobile development" },
  { id: "data-scientist", label: "Data Scientist", description: "Python, ML, statistics, and data analysis" },
  { id: "data-analyst", label: "Data Analyst", description: "SQL, Excel, visualization, and analytics" },
  { id: "machine-learning-engineer", label: "Machine Learning Engineer", description: "ML models, deployment, and optimization" },
  { id: "product-manager", label: "Product Manager", description: "Strategy, roadmap, and product development" },
  { id: "product-owner", label: "Product Owner", description: "Agile, backlog, and stakeholder management" },
  { id: "ux-designer", label: "UX Designer", description: "User research, wireframing, and usability" },
  { id: "ui-ux-designer", label: "UI/UX Designer", description: "Visual design and user experience" },
  { id: "devops-engineer", label: "DevOps Engineer", description: "CI/CD, cloud infrastructure, and automation" },
  { id: "cloud-architect", label: "Cloud Architect", description: "Cloud architecture and infrastructure" },
  { id: "data-engineer", label: "Data Engineer", description: "Data pipelines, ETL, and data warehouses" },
  { id: "qa-engineer", label: "QA Engineer", description: "Testing, automation, and quality assurance" },
  { id: "security-engineer", label: "Security Engineer", description: "Cybersecurity and application security" },
  { id: "blockchain-developer", label: "Blockchain Developer", description: "Smart contracts and Web3 development" },
];

const TABS = [
  { id: "overview", label: "Overview", icon: "🏠", color: "blue" },
  { id: "quizzes", label: "Quiz Generator", icon: "📝", color: "purple" },
  { id: "resume", label: "Resume Analysis", icon: "📄", color: "green" },
  { id: "suggested-roles", label: "Role Matching", icon: "💼", color: "orange" },
  { id: "training", label: "Training Plans", icon: "📚", color: "indigo" },
  { id: "interview", label: "Mock Interviews", icon: "🎯", color: "pink" },
  { id: "progress", label: "Progress Tracking", icon: "📊", color: "cyan" },
];

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");

  // Shared progress state
  const [progress, setProgressState] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState("");

  // Resume state
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [resumeResult, setResumeResult] = useState(null);

  // Training state
  const [trainingRoleId, setTrainingRoleId] = useState("software-engineer");
  const [customTrainingRole, setCustomTrainingRole] = useState("");
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [trainingError, setTrainingError] = useState("");
  const [trainingPlan, setTrainingPlan] = useState(null);

  // Interview state
  const [interviewRoleId, setInterviewRoleId] = useState("software-engineer");
  const [customInterviewRole, setCustomInterviewRole] = useState("");
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewError, setInterviewError] = useState("");
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [interviewAnswers, setInterviewAnswers] = useState({});
  const [interviewVoiceAnswers, setInterviewVoiceAnswers] = useState({});
  const [interviewResult, setInterviewResult] = useState(null);
  const [recordingForQuestion, setRecordingForQuestion] = useState(null);

  // News state
  const [careerNews, setCareerNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);

  // Agent Advice State
  const [agentAdvice, setAgentAdvice] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);

  // Quiz custom role state
  const [customQuizRole, setCustomQuizRole] = useState("");
  const [quizCustomLoading, setQuizCustomLoading] = useState(false);

  // Dynamic roles from resume
  const [matchedRoles, setMatchedRoles] = useState([]);

  const displayName = useMemo(
    () =>
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "User",
    [user]
  );

  const currentUserId = user?.id;

  // Fetch progress on mount
  useEffect(() => {
    if (!currentUserId) return;
    let cancelled = false;

    async function load() {
      try {
        setProgressLoading(true);
        setProgressError("");
        const data = await fetchProgress(currentUserId);
        if (!cancelled) {
          setProgressState(data);
        }
      } catch (e) {
        if (!cancelled) {
          setProgressError(e.message || "Failed to load progress");
        }
      } finally {
        if (!cancelled) setProgressLoading(false);
      }
    }

    load();
  }, [currentUserId]);

  // Initialize interview state
  useEffect(() => {
  }, []);

  // Mark roles as viewed
  useEffect(() => {
    if (!currentUserId) return;
    markRolesViewed(currentUserId).catch(() => {});
  }, [currentUserId]);

  // Load stored resume on component mount
  useEffect(() => {
    if (!currentUserId) return;
    
    async function loadStoredResume() {
      try {
        const stored = await getStoredResume(currentUserId);
        if (stored.exists) {
          setResumeText(stored.text);
          setResumeResult(stored.analysis);
          // Extract matched roles from analysis
          if (stored.analysis?.recommendedRoles) {
            const roles = stored.analysis.recommendedRoles;
            setMatchedRoles(roles);
            if (roles.length > 0) {
              const topRole = roles[0].role.toLowerCase().replace(/\s+/g, '-');
              setTrainingRoleId(topRole);
              setInterviewRoleId(topRole);
            }
          }
          console.log("Loaded stored resume from", stored.uploadedAt);
        }
      } catch (error) {
        console.error("Failed to load stored resume:", error);
      }
    }
    
    loadStoredResume();
  }, [currentUserId]);

  // Fetch career news based on recommended roles
  useEffect(() => {
    async function loadNews() {
      if (matchedRoles.length === 0) return;
      
      try {
        setNewsLoading(true);
        const primaryRole = matchedRoles[0].role || matchedRoles[0].label;
        const response = await fetch(`${import.meta.env.VITE_API_BASE || "/api"}/ai/career-news/${encodeURIComponent(primaryRole)}`);
        const data = await response.json();
        if (data.success) {
          setCareerNews(data.data);
        }
      } catch (error) {
        console.error("Failed to load news:", error);
      } finally {
        setNewsLoading(false);
      }
    }

    async function loadAgentAdvice() {
      if (matchedRoles.length === 0) return;
      
      try {
        setAgentLoading(true);
        const primaryRole = matchedRoles[0].role || matchedRoles[0].label;
        const response = await fetch(`${import.meta.env.VITE_API_BASE || "/api"}/ai/career-advice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: primaryRole })
        });
        const data = await response.json();
        if (data.success) {
          setAgentAdvice(data.data);
        }
      } catch (error) {
        console.error("Failed to load agent advice:", error);
      } finally {
        setAgentLoading(false);
      }
    }
    
    if (activeTab === "overview") {
      loadNews();
      loadAgentAdvice();
    }
  }, [matchedRoles, activeTab]);

  if (loading) return <Loading />;

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  function handleSignOut() {
    signOut();
    navigate("/login", { replace: true });
  }

  // ============================================
  // RESUME HANDLERS
  // ============================================

  async function handleResumeUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setResumeText(e.target.result);
        setResumeFile(file);
      };
      reader.readAsText(file);
    } else if (file.type === "application/pdf") {
      // For PDF, we'll send the file to backend for processing
      setResumeFile(file);
      setResumeText(`[PDF File: ${file.name}] - Will be processed by AI`);
    } else {
      setResumeError("Please upload a .txt or .pdf file");
      return;
    }
    setResumeError("");
  }

  async function handleAnalyzeResume() {
    let textToAnalyze = resumeText;
    
    if (resumeFile && resumeFile.type === "application/pdf") {
      // Create FormData to send file
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("userId", currentUserId);
      
      try {
        setResumeLoading(true);
        setResumeError("");
        
        // Send PDF to backend for analysis
        const response = await fetch(`${import.meta.env.VITE_API_BASE || "/api"}/resume/analyze`, {
          method: "POST",
          body: formData,
          headers: {
            "User-Id": currentUserId
          }
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.detail || data.error || "Failed to analyze resume");
        }
        
        setResumeResult(data.data);
        
        // Extract matched roles
        if (data.data.recommendedRoles) {
          const roles = data.data.recommendedRoles;
          setMatchedRoles(roles);
          if (roles.length > 0) {
            const topRole = roles[0].role.toLowerCase().replace(/\s+/g, '-');
            setTrainingRoleId(topRole);
            setInterviewRoleId(topRole);
          }
        }
        
        const updated = await fetchProgress(currentUserId);
        setProgressState(updated);
        
        // Save resume text as well
        await saveResume(currentUserId, textToAnalyze, resumeFile?.name);
        
      } catch (e) {
        setResumeError(e.message || "Failed to analyze resume");
      } finally {
        setResumeLoading(false);
      }
      return;
    }
    
    if (!textToAnalyze.trim()) {
      setResumeError("Please provide resume text first.");
      return;
    }

    try {
      setResumeLoading(true);
      setResumeError("");
      
      const result = await analyzeResume(currentUserId, textToAnalyze.trim(), resumeFile?.name);
      setResumeResult(result);
      
      // Extract matched roles
      if (result.recommendedRoles) {
        const roles = result.recommendedRoles;
        setMatchedRoles(roles);
        if (roles.length > 0) {
          const topRole = roles[0].role.toLowerCase().replace(/\s+/g, '-');
          setTrainingRoleId(topRole);
          setInterviewRoleId(topRole);
        }
      }
      
      // Save the resume
      await saveResume(currentUserId, textToAnalyze, resumeFile?.name);
      
      const updated = await fetchProgress(currentUserId);
      setProgressState(updated);
    } catch (e) {
      setResumeError(e.message || "Failed to analyze resume");
    } finally {
      setResumeLoading(false);
    }
  }

  // ============================================
  // TRAINING HANDLERS
  // ============================================

  async function handleLoadTraining() {
    try {
      setTrainingLoading(true);
      setTrainingError("");
      setTrainingPlan(null); // Clear previous plan to show generating state
      
      let roleId = trainingRoleId;
      if (trainingRoleId === "custom") {
        if (!customTrainingRole.trim()) {
          setTrainingError("Please enter a custom role name");
          return;
        }
        roleId = customTrainingRole.trim();
      }
      
      const data = await fetchTrainingPlan(currentUserId, roleId);
      setTrainingPlan(data);
      const updated = await fetchProgress(currentUserId);
      setProgressState(updated);
    } catch (e) {
      setTrainingError(e.message || "Failed to load training plan");
    } finally {
      setTrainingLoading(false);
    }
  }

  // ============================================
  // INTERVIEW HANDLERS
  // ============================================

  async function handleLoadInterviewQuestions() {
    console.log('🎭 Interview loading started');
    console.log('🎭 Role ID:', interviewRoleId);
    console.log('🎭 Custom Role:', customInterviewRole);
    
    try {
      setInterviewLoading(true);
      setInterviewError("");
      setInterviewResult(null);
      setInterviewQuestions([]); // Clear questions to show generating state
      
      let roleId = interviewRoleId;
      if (interviewRoleId === "custom") {
        if (!customInterviewRole.trim()) {
          setInterviewError("Please enter a custom role name");
          return;
        }
        roleId = customInterviewRole.trim();
      }
      
      console.log('🎭 Fetching questions for role:', roleId);
      
      // Use real API call for AI-generated questions
      const data = await fetchInterviewQuestions(roleId);
      
      console.log('🎭 API Response:', data);
      console.log('🎭 Questions count:', data.length);
      
      setInterviewQuestions(data);
      setInterviewAnswers({});
      setInterviewVoiceAnswers({});
      console.log('✅ Interview questions set in state');
    } catch (e) {
      console.error('❌ Interview loading error:', e);
      setInterviewError(e.message || "Failed to load interview questions");
    } finally {
      setInterviewLoading(false);
    }
  }

  function handleVoiceTranscript(questionIndex, transcript) {
    setInterviewAnswers(prev => ({
      ...prev,
      [questionIndex]: transcript
    }));
  }

  function handleVoiceRecordingComplete(questionIndex, audioBlob, audioUrl) {
    setInterviewVoiceAnswers(prev => ({
      ...prev,
      [questionIndex]: { audioBlob, audioUrl, timestamp: new Date().toISOString() }
    }));
    setRecordingForQuestion(null);
  }

  async function handleSubmitInterview() {
    const answersArray = interviewQuestions.map((q, idx) => ({
      question: q,
      text: interviewAnswers[idx] || "",
    }));

    if (!answersArray.some((a) => a.text.trim())) {
      setInterviewError("Please answer at least one question.");
      return;
    }

    try {
      setInterviewLoading(true);
      setInterviewError("");
      
      let roleId = interviewRoleId;
      if (interviewRoleId === "custom") {
        roleId = customInterviewRole.trim();
      }
      
      const result = await submitInterviewAnswers(
        currentUserId,
        roleId,
        answersArray
      );
      setInterviewResult(result);
      const updated = await fetchProgress(currentUserId);
      setProgressState(updated);
    } catch (e) {
      setInterviewError(e.message || "Failed to submit answers");
    } finally {
      setInterviewLoading(false);
    }
  }

  // ============================================
  // QUIZ HANDLERS (Custom Role)
  // ============================================

  async function handleCustomQuiz() {
    if (!customQuizRole.trim()) return;
    
    setQuizCustomLoading(true);
    try {
      navigate(`/quiz/custom?role=${encodeURIComponent(customQuizRole.trim())}`);
    } finally {
      setQuizCustomLoading(false);
    }
  }

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  function renderSidebar() {
    const getColorClasses = (color, isActive) => {
      const colors = {
        blue: isActive ? 'from-blue-500 to-blue-600' : 'hover:bg-blue-50',
        purple: isActive ? 'from-purple-500 to-purple-600' : 'hover:bg-purple-50',
        green: isActive ? 'from-green-500 to-green-600' : 'hover:bg-green-50',
        orange: isActive ? 'from-orange-500 to-orange-600' : 'hover:bg-orange-50',
        indigo: isActive ? 'from-indigo-500 to-indigo-600' : 'hover:bg-indigo-50',
        pink: isActive ? 'from-pink-500 to-pink-600' : 'hover:bg-pink-50',
        cyan: isActive ? 'from-cyan-500 to-cyan-600' : 'hover:bg-cyan-50',
      };
      return colors[color] || colors.blue;
    };

    return (
      <div className="w-72 bg-white/90 backdrop-blur-xl shadow-2xl border-r border-gray-100">
        <div className="p-6">
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VidyaMitra</h2>
              <p className="text-xs text-gray-500">Career Development Platform</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const gradientClass = getColorClasses(tab.color, isActive);
              
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center space-x-3 transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-r ${gradientClass} text-white shadow-lg`
                      : `text-gray-700 ${getColorClasses(tab.color, false)} hover:shadow-md`
                  }`}
                >
                  <span className={`text-xl ${isActive ? 'scale-110' : ''}`}>{tab.icon}</span>
                  <div className="flex-1">
                    <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-700'}`}>{tab.label}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-4">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-sm font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{displayName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignOut}
              className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Logout</span>
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  function renderOverview() {
    const hasActivity = progress && (
      (progress.quizzesCompleted && progress.quizzesCompleted > 0) ||
      (progress.resumeAnalyzed && progress.resumeAnalyzed)
    );

    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Welcome to VidyaMitra
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Your AI-powered career development platform
          </p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">All systems operational</span>
          </div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Activities"
            value={hasActivity ? 
              `${(progress?.quizzesCompleted || 0) + (progress?.resumeAnalyzed ? 1 : 0) + (progress?.interviewsCompleted || 0)}` : 
              "0"
            }
            icon={ChartBarIcon}
            color="blue"
          />
          <StatCard
            title="Quizzes Completed"
            value={progress?.quizzesCompleted || 0}
            icon={BookOpenIcon}
            color="purple"
          />
          <StatCard
            title="Interviews Done"
            value={progress?.interviewsCompleted || 0}
            icon={UserGroupIcon}
            color="pink"
          />
          <StatCard
            title="Resume Status"
            value={progress?.resumeAnalyzed ? "✓ Analyzed" : "--"}
            icon={DocumentTextIcon}
            color="orange"
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={BookOpenIcon}
              title="Take a Quiz"
              description="Test your skills with our AI-generated quizzes"
              color="purple"
              onClick={() => setActiveTab("quizzes")}
            />
            <FeatureCard
              icon={DocumentTextIcon}
              title="Analyze Resume"
              description="Get AI-powered insights on your resume"
              color="green"
              onClick={() => setActiveTab("resume")}
            />
            <FeatureCard
              icon={BriefcaseIcon}
              title="Find Roles"
              description="Discover career opportunities matching your skills"
              color="orange"
              onClick={() => setActiveTab("suggested-roles")}
            />
          </div>
        </motion.div>

        {/* Career Agent Insights Section - AGENTIC AI */}
        {matchedRoles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <GlassCard className="p-6 border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50/50 to-white">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <SparklesIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">AI Career Agent Insights</h2>
                  {agentLoading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                  ) : agentAdvice ? (
                    <div className="prose prose-purple max-w-none">
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                        {agentAdvice}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Gathering insights based on your profile...</p>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Progress Overview */}
        {progress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Progress</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <GlassCard className="p-6 text-center">
                <ProgressRing progress={progress.completionPercent || 0} size={80} color="blue" />
                <p className="mt-4 font-semibold text-gray-800">Overall Progress</p>
                <p className="text-sm text-gray-600">{progress.completionPercent || 0}% Complete</p>
              </GlassCard>
              <GlassCard className="p-6 text-center">
                <div className="text-4xl font-bold text-purple-600">{progress.averageScore || 0}%</div>
                <p className="mt-2 font-semibold text-gray-800">Average Quiz Score</p>
                <p className="text-sm text-gray-600">Based on {progress.quizScores?.length || 0} quizzes</p>
              </GlassCard>
              <GlassCard className="p-6 text-center">
                <div className="text-4xl font-bold text-green-600">{matchedRoles.length}</div>
                <p className="mt-2 font-semibold text-gray-800">Matched Roles</p>
                <p className="text-sm text-gray-600">Based on your resume</p>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* Industry News Section */}
        {matchedRoles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <SparklesIcon className="w-6 h-6 text-yellow-500 mr-2" />
              Real-time Industry News: {matchedRoles[0].role || matchedRoles[0].label}
            </h2>
            {newsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : careerNews.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {careerNews.map((article, idx) => (
                  <GlassCard key={idx} className="p-4 flex flex-col h-full">
                    {article.urlToImage && (
                      <img 
                        src={article.urlToImage} 
                        alt={article.title} 
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2">{article.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3 flex-1 mb-4">{article.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">{new Date(article.publishedAt).toLocaleDateString()}</span>
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm font-medium hover:underline"
                      >
                        Read More →
                      </a>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-gray-50 rounded-xl text-center text-gray-500 border border-dashed border-gray-300">
                No recent news found for your primary matched role.
              </div>
            )}
          </motion.div>
        )}

        {progressError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-yellow-800">
                Some features may be limited. Backend services are starting up...
              </p>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  function renderQuizzes() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Generator</h2>
          <p className="text-gray-600">Test your skills with role-specific quizzes</p>
        </div>

        {/* Custom Role Input */}
        <GlassCard className="p-6">
          <h3 className="font-semibold text-lg mb-4">Create Custom Quiz</h3>
          <div className="flex gap-4">
            <input
              type="text"
              value={customQuizRole}
              onChange={(e) => setCustomQuizRole(e.target.value)}
              placeholder="Enter custom role (e.g., Cloud Architect, Security Engineer)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <AnimatedButton
              onClick={handleCustomQuiz}
              disabled={!customQuizRole.trim() || quizCustomLoading}
              className="whitespace-nowrap"
            >
              {quizCustomLoading ? "Loading..." : "Generate Quiz"}
            </AnimatedButton>
          </div>
        </GlassCard>

        {/* Predefined Roles */}
        <div>
          <h3 className="font-semibold text-lg mb-4">
            {matchedRoles.length > 0 ? "Suggested quizzes based on your profile:" : "Choose from popular career paths:"}
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(matchedRoles.length > 0 ? matchedRoles.slice(0, 6).map(mr => ({
              id: mr.role.toLowerCase().replace(/\s+/g, '-'),
              label: mr.role,
              description: `Recommended for you with ${mr.matchPercentage || mr.matchScore}% match.`
            })) : DEFAULT_ROLES.slice(0, 6)).map((role) => (
              <motion.div
                key={role.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
              >
                <h3 className="font-semibold text-lg mb-2">{role.label}</h3>
                <p className="text-gray-600 text-sm mb-4">{role.description}</p>
                <AnimatedButton
                  onClick={() => navigate(`/quiz/${role.id}`)}
                  className="w-full"
                >
                  Start Quiz
                </AnimatedButton>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderResume() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Resume Analysis</h2>
          <p className="text-gray-600">Upload your resume for AI-powered analysis</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upload Section */}
          <GlassCard className="p-6">
            <h3 className="font-semibold text-lg mb-4">Upload Resume</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Resume (PDF or TXT)
                </label>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleResumeUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {resumeFile && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Selected: {resumeFile.name}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or paste resume text:
                </label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-40"
                />
              </div>

              <AnimatedButton
                onClick={handleAnalyzeResume}
                disabled={(!resumeFile && !resumeText.trim()) || resumeLoading}
                className="w-full"
              >
                {resumeLoading ? "Analyzing..." : "Analyze Resume"}
              </AnimatedButton>

              {resumeError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{resumeError}</p>
                </div>
              )}

              {resumeResult && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600">✓ Resume analyzed successfully!</p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Results Section */}
          {resumeResult && (
            <div className="space-y-6">
              {/* Score Card */}
              <GradientCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Resume Score</h3>
                    <p className="text-4xl font-bold text-white mt-2">{resumeResult.score || 0}/100</p>
                  </div>
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <TrophyIcon className="w-10 h-10 text-white" />
                  </div>
                </div>
              </GradientCard>

              {/* Strengths */}
              {resumeResult.strengths && resumeResult.strengths.length > 0 && (
                <GlassCard className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {resumeResult.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              )}

              {/* Missing Skills / Gaps */}
              {resumeResult.missingSkills && resumeResult.missingSkills.length > 0 && (
                <GlassCard className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <ChartBarIcon className="w-5 h-5 text-orange-500 mr-2" />
                    Skill Gaps
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {resumeResult.missingSkills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Suggestions */}
              {resumeResult.suggestions && resumeResult.suggestions.length > 0 && (
                <GlassCard className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <RocketLaunchIcon className="w-5 h-5 text-purple-500 mr-2" />
                    Suggestions
                  </h3>
                  <ul className="space-y-2">
                    {resumeResult.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-purple-500 mr-2">💡</span>
                        <span className="text-gray-700">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderSuggestedRoles() {
    const allRoles = matchedRoles;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Role Matching</h2>
          <p className="text-gray-600">
            {matchedRoles.length > 0 
              ? "Based on your resume analysis" 
              : "Analyze your resume to get personalized role suggestions"}
          </p>
        </div>

        {matchedRoles.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-yellow-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-yellow-800">Resume Analysis Required</p>
                <p className="text-sm text-yellow-600">Please upload and analyze your resume to get role suggestions</p>
              </div>
            </div>
            <AnimatedButton
              onClick={() => setActiveTab("resume")}
              className="mt-4"
            >
              Analyze Resume
            </AnimatedButton>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allRoles.map((role, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg">{role.role}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  (role.matchPercentage || role.matchScore) >= 80 
                    ? 'bg-green-100 text-green-700'
                    : (role.matchPercentage || role.matchScore) >= 60
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {role.matchPercentage || role.matchScore || 0}% Match
                </span>
              </div>
              
              {role.requiredSkills && role.requiredSkills.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Required Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {role.requiredSkills.slice(0, 5).map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {role.skillGaps && role.skillGaps.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Skills to acquire:</p>
                  <div className="flex flex-wrap gap-1">
                    {role.skillGaps.slice(0, 3).map((gap, idx) => (
                      <span key={idx} className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs">
                        {gap}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <AnimatedButton
                onClick={() => {
                  setTrainingRoleId(role.role?.toLowerCase().replace(/\s+/g, '-') || role.id);
                  setActiveTab("training");
                }}
                className="w-full"
                size="sm"
              >
                View Training Plan
              </AnimatedButton>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  function renderProgress() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Progress Tracking</h2>
          <p className="text-gray-600">Track your learning journey</p>
        </div>

        {/* Overall Progress */}
        <div className="grid gap-6 md:grid-cols-4">
          <StatCard
            title="Completion"
            value={`${progress?.completionPercent || 0}%`}
            icon={ChartBarIcon}
            color="blue"
          />
          <StatCard
            title="Quizzes Done"
            value={progress?.quizzesCompleted || 0}
            icon={BookOpenIcon}
            color="purple"
          />
          <StatCard
            title="Interviews Done"
            value={progress?.interviewsCompleted || 0}
            icon={UserGroupIcon}
            color="pink"
          />
          <StatCard
            title="Training Plans"
            value={progress?.trainingPlansViewed || 0}
            icon={AcademicCapIcon}
            color="indigo"
          />
        </div>

        {/* Quiz Scores History */}
        {progress?.quizScores && progress.quizScores.length > 0 && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-lg mb-4">Quiz Performance History</h3>
            <div className="space-y-3">
              {progress.quizScores.map((score, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Quiz {idx + 1}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="font-medium text-gray-800 w-12 text-right">{score}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">Average Score</span>
                <span className="text-2xl font-bold text-purple-600">{progress.averageScore || 0}%</span>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Resume Status */}
        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard className="p-6">
            <h3 className="font-semibold text-lg mb-4">Resume Analysis</h3>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                progress?.resumeAnalyzed ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {progress?.resumeAnalyzed ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                ) : (
                  <DocumentTextIcon className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {progress?.resumeAnalyzed ? "Analyzed" : "Not Yet Analyzed"}
                </p>
                <p className="text-sm text-gray-600">
                  {progress?.resumeAnalyzed 
                    ? `Score: ${resumeResult?.score || 0}/100` 
                    : "Upload your resume to get started"}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-semibold text-lg mb-4">Interview Practice</h3>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                progress?.interviewsCompleted > 0 ? 'bg-purple-100' : 'bg-gray-100'
              }`}>
                <UserGroupIcon className={`w-6 h-6 ${progress?.interviewsCompleted > 0 ? 'text-purple-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {progress?.interviewsCompleted || 0} Interviews Completed
                </p>
                <p className="text-sm text-gray-600">
                  Practice makes perfect!
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {!progress && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <p className="text-yellow-800">Start taking quizzes and analyzing your resume to see your progress!</p>
          </div>
        )}
      </div>
    );
  }

  function renderTraining() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Training Plans</h2>
          <p className="text-gray-600">Structured learning paths for career growth</p>
        </div>

        {/* Role Selection */}
        <GlassCard className="p-6">
          <h3 className="font-semibold text-lg mb-4">Select Role for Training</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Choose a role:</label>
              <select
                value={trainingRoleId}
                onChange={(e) => setTrainingRoleId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="custom">Custom Role...</option>
                {DEFAULT_ROLES.map((role) => (
                  <option key={role.id} value={role.id}>{role.label}</option>
                ))}
              </select>
            </div>
            
            {trainingRoleId === "custom" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter custom role:</label>
                <input
                  type="text"
                  value={customTrainingRole}
                  onChange={(e) => setCustomTrainingRole(e.target.value)}
                  placeholder="e.g., Cloud Architect, Data Engineer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <AnimatedButton
              onClick={handleLoadTraining}
              disabled={trainingLoading || (trainingRoleId === "custom" && !customTrainingRole.trim())}
              className="w-full md:w-auto"
            >
              {trainingLoading ? "Generating..." : "Get Training Plan"}
            </AnimatedButton>
          </div>

          {trainingError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{trainingError}</p>
            </div>
          )}
        </GlassCard>

        {/* Training Plan Display */}
        {trainingPlan && (
          <div className="space-y-6">
            {/* Role & Overview */}
            <GradientCard className="p-6">
              <h3 className="text-2xl font-bold text-white mb-2">{trainingPlan.role}</h3>
              <p className="text-white/80">Your personalized training roadmap</p>
            </GradientCard>

            {/* Certifications - NEW FEATURE */}
            {trainingPlan.certifications && trainingPlan.certifications.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <TrophyIcon className="w-5 h-5 text-yellow-500 mr-2" />
                  Recommended Certifications
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {trainingPlan.certifications.map((cert, idx) => (
                    <div key={idx} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">{cert.name}</h4>
                          <p className="text-sm text-gray-600">{cert.provider}</p>
                        </div>
                        <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs">
                          Certification
                        </span>
                      </div>
                      {cert.url && (
                        <a 
                          href={cert.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-2 text-sm text-blue-600 hover:underline"
                        >
                          View Certification →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Courses */}
            {trainingPlan.courses && trainingPlan.courses.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <AcademicCapIcon className="w-5 h-5 text-blue-500 mr-2" />
                  Recommended Courses
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {trainingPlan.courses.map((course, idx) => (
                    <div key={idx} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-gray-800">{course.title}</h4>
                      <p className="text-sm text-gray-600">{course.platform}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{course.duration}</span>
                        {course.url && (
                          <a 
                            href={course.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View Course →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Roadmap */}
            {trainingPlan.roadmap && trainingPlan.roadmap.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <ClockIcon className="w-5 h-5 text-green-500 mr-2" />
                  Learning Roadmap
                </h3>
                <div className="space-y-4">
                  {trainingPlan.roadmap.map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {step.step || idx + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{step.title}</h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                        {step.duration && (
                          <span className="text-xs text-gray-500 mt-1 inline-block">
                            ⏱️ {step.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Projects */}
            {trainingPlan.projects && trainingPlan.projects.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <RocketLaunchIcon className="w-5 h-5 text-purple-500 mr-2" />
                  Practice Projects
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {trainingPlan.projects.map((project, idx) => (
                    <div key={idx} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h4 className="font-medium text-gray-800">{project.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      {project.skillsLearned && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.skillsLearned.map((skill, sidx) => (
                            <span key={sidx} className="px-2 py-1 bg-purple-200 text-purple-700 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* YouTube Resources - REAL TIME DATA */}
            {trainingPlan.youtubeResources && (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Videos */}
                {trainingPlan.youtubeResources.videos && trainingPlan.youtubeResources.videos.length > 0 && (
                  <GlassCard className="p-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      Real-time YouTube Tutorials
                    </h3>
                    <div className="space-y-4">
                      {trainingPlan.youtubeResources.videos.map((video, idx) => (
                        <div key={idx} className="flex space-x-3 items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                          <img src={video.thumbnail} alt={video.title} className="w-24 h-16 object-cover rounded" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium line-clamp-1">{video.title}</h4>
                            <a href={video.link} target="_blank" rel="noopener noreferrer" className="text-xs text-red-600 hover:underline">
                              Watch Video →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}

                {/* Playlists */}
                {trainingPlan.youtubeResources.playlists && trainingPlan.youtubeResources.playlists.length > 0 && (
                  <GlassCard className="p-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <BookOpenIcon className="w-5 h-5 text-red-600 mr-2" />
                      Complete Courses (Playlists)
                    </h3>
                    <div className="space-y-4">
                      {trainingPlan.youtubeResources.playlists.map((playlist, idx) => (
                        <div key={idx} className="flex space-x-3 items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                          <img src={playlist.thumbnail} alt={playlist.title} className="w-24 h-16 object-cover rounded" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium line-clamp-1">{playlist.title}</h4>
                            <a href={playlist.link} target="_blank" rel="noopener noreferrer" className="text-xs text-red-600 hover:underline">
                              View Playlist →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}
              </div>
            )}
          </div>
        )}

        {!trainingPlan && !trainingLoading && (
          <div className="text-center py-12 text-gray-500">
            Select a role above to get your personalized training plan with certifications!
          </div>
        )}
      </div>
    );
  }

  function renderInterview() {
    console.log('🎭 Rendering Interview Component');
    console.log('🎭 Questions in state:', interviewQuestions.length);
    console.log('🎭 Questions data:', interviewQuestions);
    console.log('🎭 Loading state:', interviewLoading);
    console.log('🎭 Error state:', interviewError);
    
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Mock Interviews</h2>
          <p className="text-gray-600">Practice with AI-generated interview questions</p>
        </div>

        {/* Role Selection */}
        <GlassCard className="p-6">
          <h3 className="font-semibold text-lg mb-4">Select Role for Interview</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Choose a role:</label>
              <select
                value={interviewRoleId}
                onChange={(e) => setInterviewRoleId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="custom">Custom Role...</option>
                {DEFAULT_ROLES.map((role) => (
                  <option key={role.id} value={role.id}>{role.label}</option>
                ))}
              </select>
            </div>
            
            {interviewRoleId === "custom" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter custom role:</label>
                <input
                  type="text"
                  value={customInterviewRole}
                  onChange={(e) => setCustomInterviewRole(e.target.value)}
                  placeholder="e.g., DevOps Engineer, AI Specialist"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <AnimatedButton
              onClick={handleLoadInterviewQuestions}
              disabled={interviewLoading || (interviewRoleId === "custom" && !customInterviewRole.trim())}
              className="w-full md:w-auto"
            >
              {interviewLoading ? "Generating..." : "Start Interview"}
            </AnimatedButton>
          </div>

          {interviewError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{interviewError}</p>
            </div>
          )}
        </GlassCard>

        {/* Interview Questions with Voice Recording */}
        {interviewQuestions.length > 0 && !interviewResult && (
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold mb-4">Interview Questions</h3>
            <div className="space-y-6">
              {interviewQuestions.map((question, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-3">
                    <span className="inline-block w-6 h-6 bg-pink-500 text-white rounded-full text-center text-sm mr-2">
                      {index + 1}
                    </span>
                    {typeof question === 'string' ? question : question.question}
                  </p>
                  
                  {/* Text Answer */}
                  <textarea
                    value={interviewAnswers[index] || ''}
                    onChange={(e) => setInterviewAnswers(prev => ({
                      ...prev,
                      [index]: e.target.value
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                    rows={3}
                    placeholder="Type your answer here..."
                  />
                  
                  {/* Voice Recording Option */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Or record your answer:</p>
                    {recordingForQuestion === index ? (
                      <VoiceRecorder 
                        onTranscript={(transcript) => handleVoiceTranscript(index, transcript)}
                        onRecordingComplete={(blob, url) => handleVoiceRecordingComplete(index, blob, url)}
                        isRecording={recordingForQuestion === index}
                        setIsRecording={(recording) => {
                          if (!recording) setRecordingForQuestion(null);
                        }}
                      />
                    ) : (
                      <button
                        onClick={() => setRecordingForQuestion(index)}
                        className="flex items-center px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200"
                      >
                        🎤 Record Voice Answer
                      </button>
                    )}
                  </div>

                  {/* Show recorded audio if available */}
                  {interviewVoiceAnswers[index] && (
                    <div className="mt-2">
                      <AudioPlayer 
                        audioUrl={interviewVoiceAnswers[index].audioUrl} 
                        title="Your recorded answer" 
                      />
                    </div>
                  )}
                </div>
              ))}
              
              <AnimatedButton
                onClick={handleSubmitInterview}
                disabled={interviewLoading}
                className="w-full"
              >
                {interviewLoading ? "Submitting..." : "Submit Answers & Get Feedback"}
              </AnimatedButton>
            </div>
          </GlassCard>
        )}

        {/* Interview Results */}
        {interviewResult && (
          <div className="space-y-6">
            <GradientCard className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Interview Score</h3>
                <p className="text-5xl font-bold text-white">{interviewResult.score || 0}%</p>
              </div>
            </GradientCard>

            {interviewResult.feedback && interviewResult.feedback.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="font-semibold text-lg mb-4">Detailed Feedback</h3>
                <div className="space-y-4">
                  {interviewResult.feedback.map((fb, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-800">Question {fb.questionIndex + 1}</span>
                        <span className={`px-2 py-1 rounded text-sm ${
                          fb.rating >= 7 ? 'bg-green-100 text-green-700' :
                          fb.rating >= 5 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {fb.rating}/10
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{fb.feedback}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {interviewResult.strengths && interviewResult.strengths.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  Your Strengths
                </h3>
                <ul className="space-y-2">
                  {interviewResult.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}

            {interviewResult.areasForImprovement && interviewResult.areasForImprovement.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <RocketLaunchIcon className="w-5 h-5 text-orange-500 mr-2" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {interviewResult.areasForImprovement.map((area, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-orange-500 mr-2">→</span>
                      <span className="text-gray-700">{area}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}

            {interviewResult.finalAdvice && (
              <GlassCard className="p-6">
                <h3 className="font-semibold text-lg mb-4">Final Advice</h3>
                <p className="text-gray-700">{interviewResult.finalAdvice}</p>
              </GlassCard>
            )}

            <AnimatedButton
              onClick={() => {
                setInterviewResult(null);
                setInterviewQuestions([]);
                setInterviewAnswers({});
                setInterviewVoiceAnswers({});
              }}
              className="w-full"
            >
              Practice Another Interview
            </AnimatedButton>
          </div>
        )}
      </div>
    );
  }

  function renderContent() {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "quizzes":
        return renderQuizzes();
      case "resume":
        return renderResume();
      case "suggested-roles":
        return renderSuggestedRoles();
      case "training":
        return renderTraining();
      case "interview":
        return renderInterview();
      case "progress":
        return renderProgress();
      default:
        return renderOverview();
    }
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <div className="relative z-10">
        <div className="flex">
          {renderSidebar()}
          <div className="flex-1 p-8 overflow-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

