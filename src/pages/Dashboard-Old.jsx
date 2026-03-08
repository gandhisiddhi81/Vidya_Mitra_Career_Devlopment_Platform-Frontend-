import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loading from "../components/Loading";
import { analyzeResume } from "../api/resume";
import { fetchTrainingPlan } from "../api/training";
import { fetchInterviewQuestions, submitInterviewAnswers } from "../api/interview";
import { fetchProgress, markRolesViewed } from "../api/progress";

const ROLE_OPTIONS = [
  { id: "software-engineer", label: "Software Engineer", backendRole: "software-engineer" },
  { id: "data-scientist", label: "Data Scientist", backendRole: "data-scientist" },
  { id: "product-manager", label: "Product Manager", backendRole: "product-manager" },
  { id: "ux-designer", label: "UX Designer", backendRole: "ux-designer" },
];

const TABS = [
  { id: "overview", label: "Overview", icon: "🏠" },
  { id: "quizzes", label: "Quizzes", icon: "📝" },
  { id: "resume", label: "Resume Upload", icon: "📄" },
  { id: "suggested-roles", label: "Suggested Roles", icon: "💼" },
  { id: "progress", label: "Progress", icon: "📊" },
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
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [resumeResult, setResumeResult] = useState(null);

  // Training state
  const [trainingRoleId, setTrainingRoleId] = useState(ROLE_OPTIONS[0].id);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [trainingError, setTrainingError] = useState("");
  const [trainingPlan, setTrainingPlan] = useState(null);

  // Interview state
  const [interviewRoleId, setInterviewRoleId] = useState(ROLE_OPTIONS[0].id);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewError, setInterviewError] = useState("");
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [interviewAnswers, setInterviewAnswers] = useState({});
  const [interviewResult, setInterviewResult] = useState(null);

  const displayName = useMemo(
    () =>
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "User",
    [user]
  );

  const currentUserId = user?.id;

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

  useEffect(() => {
    if (!currentUserId) return;
    markRolesViewed(currentUserId).catch(() => {});
  }, [currentUserId]);

  if (loading) return <Loading />;

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  function handleSignOut() {
    signOut();
    navigate("/login", { replace: true });
  }

  async function handleAnalyzeResume() {
    if (!resumeText.trim()) {
      setResumeError("Please paste your resume text first.");
      return;
    }
    try {
      setResumeLoading(true);
      setResumeError("");
      const result = await analyzeResume(currentUserId, resumeText.trim());
      setResumeResult(result);
      const updated = await fetchProgress(currentUserId);
      setProgressState(updated);
    } catch (e) {
      setResumeError(e.message || "Failed to analyze resume");
    } finally {
      setResumeLoading(false);
    }
  }

  async function handleLoadTraining() {
    const roleDef = ROLE_OPTIONS.find((r) => r.id === trainingRoleId) || ROLE_OPTIONS[0];
    try {
      setTrainingLoading(true);
      setTrainingError("");
      const data = await fetchTrainingPlan(currentUserId, roleDef.backendRole);
      setTrainingPlan(data);
      const updated = await fetchProgress(currentUserId);
      setProgressState(updated);
    } catch (e) {
      setTrainingError(e.message || "Failed to load training plan");
    } finally {
      setTrainingLoading(false);
    }
  }

  async function handleLoadInterviewQuestions() {
    const roleDef = ROLE_OPTIONS.find((r) => r.id === interviewRoleId) || ROLE_OPTIONS[0];
    try {
      setInterviewLoading(true);
      setInterviewError("");
      setInterviewResult(null);
      const data = await fetchInterviewQuestions(roleDef.backendRole);
      setInterviewQuestions(data.questions);
      setInterviewAnswers({});
    } catch (e) {
      setInterviewError(e.message || "Failed to load interview questions");
    } finally {
      setInterviewLoading(false);
    }
  }

  async function handleSubmitInterview() {
    const roleDef = ROLE_OPTIONS.find((r) => r.id === interviewRoleId) || ROLE_OPTIONS[0];
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
      const result = await submitInterviewAnswers(
        currentUserId,
        roleDef.backendRole,
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

  function renderOverview() {
    const completion = progress?.completionPercent ?? 0;
    const hasActivity = completion > 0;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            Welcome to VidyaMitra
          </h1>
          <p className="text-slate-600">
            {hasActivity
              ? "Keep going – your progress updates as you complete activities."
              : "No activity yet. Start a quiz, upload your resume, or try a mock interview to track progress."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {ROLE_OPTIONS.map((role) => (
            <div
              key={role.id}
              className="bg-white rounded-xl shadow p-6 border border-slate-200"
            >
              <h2 className="text-lg font-semibold text-slate-800 mb-2">
                {role.label}
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                10-question quiz tailored to this role.
              </p>
              <Link
                to={`/quiz/${role.backendRole}`}
                className="inline-block px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
              >
                Start Quiz
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderResume() {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-1">
            Resume Upload & Analysis
          </h2>
          <p className="text-slate-600 text-sm">
            Paste your resume text below. VidyaMitra will score it, extract key
            skills, and suggest improvements.
          </p>
        </div>

        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          rows={8}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Paste your resume text here..."
        />

        {resumeError && (
          <p className="text-sm text-red-600">{resumeError}</p>
        )}

        <button
          onClick={handleAnalyzeResume}
          disabled={resumeLoading}
          className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resumeLoading ? "Analyzing..." : "Analyze Resume"}
        </button>

        {resumeResult && (
          <div className="mt-4 bg-white rounded-xl shadow p-6 space-y-3 border border-slate-200">
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-slate-600">Resume Score</span>
              <span className="text-3xl font-bold text-indigo-600">
                {resumeResult.score} / 100
              </span>
            </div>
            <p className="text-sm text-slate-600">
              {resumeResult.summary} (Words: {resumeResult.wordCount})
            </p>

            {resumeResult.skills?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-800 mb-1">
                  Detected skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {resumeResult.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {resumeResult.suggestions?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-800 mb-1">
                  Suggestions
                </p>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                  {resumeResult.suggestions.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  function renderTraining() {
    const selectedRole =
      ROLE_OPTIONS.find((r) => r.id === trainingRoleId) || ROLE_OPTIONS[0];

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-1">
              Training Plan
            </h2>
            <p className="text-slate-600 text-sm">
              Get a focused learning roadmap for your chosen role.
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <select
              value={trainingRoleId}
              onChange={(e) => setTrainingRoleId(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleLoadTraining}
              disabled={trainingLoading}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {trainingLoading ? "Loading..." : "Load Plan"}
            </button>
          </div>
        </div>

        {trainingError && (
          <p className="text-sm text-red-600">{trainingError}</p>
        )}

        {trainingPlan && (
          <div className="space-y-3">
            {trainingPlan.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {item.focus}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  ~{item.durationHours} hours
                </span>
              </div>
            ))}
          </div>
        )}

        {!trainingPlan && !trainingLoading && (
          <p className="text-sm text-slate-500">
            Choose a role and click &quot;Load Plan&quot; to see your curated
            roadmap.
          </p>
        )}
      </div>
    );
  }

  function renderInterview() {
    const selectedRole =
      ROLE_OPTIONS.find((r) => r.id === interviewRoleId) || ROLE_OPTIONS[0];

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-1">
              Mock Interview
            </h2>
            <p className="text-slate-600 text-sm">
              Practice behavioral and role-specific questions with structured feedback.
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <select
              value={interviewRoleId}
              onChange={(e) => setInterviewRoleId(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleLoadInterviewQuestions}
              disabled={interviewLoading}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {interviewLoading ? "Loading..." : "Load Questions"}
            </button>
          </div>
        </div>

        {interviewError && (
          <p className="text-sm text-red-600">{interviewError}</p>
        )}

        {interviewQuestions.length > 0 && (
          <div className="space-y-4">
            {interviewQuestions.map((q, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow p-4 border border-slate-200"
              >
                <p className="text-sm font-medium text-slate-800 mb-2">
                  Q{idx + 1}. {q}
                </p>
                <textarea
                  rows={3}
                  value={interviewAnswers[idx] || ""}
                  onChange={(e) =>
                    setInterviewAnswers((prev) => ({
                      ...prev,
                      [idx]: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Type your answer here..."
                />
              </div>
            ))}

            <button
              onClick={handleSubmitInterview}
              disabled={interviewLoading}
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {interviewLoading ? "Submitting..." : "Get Feedback"}
            </button>
          </div>
        )}

        {!interviewQuestions.length && !interviewLoading && (
          <p className="text-sm text-slate-500">
            Load questions for your role, answer them, and we&apos;ll score your responses.
          </p>
        )}

        {interviewResult && (
          <div className="mt-4 bg-white rounded-xl shadow p-6 space-y-3 border border-slate-200">
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-slate-600">Interview Score</span>
              <span className="text-3xl font-bold text-indigo-600">
                {interviewResult.score} / 100
              </span>
            </div>
            {interviewResult.feedback?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-800 mb-1">
                  Feedback
                </p>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                  {interviewResult.feedback.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  function renderProgress() {
    if (progressLoading && !progress) {
      return <Loading />;
    }

    if (progressError) {
      return <p className="text-sm text-red-600">{progressError}</p>;
    }

    const data = progress || {
      resumeUploaded: false,
      quizzesCompleted: 0,
      interviewsCompleted: 0,
      trainingPlansViewed: 0,
      suggestedRolesViewed: 0,
      completionPercent: 0,
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-1">
            Progress Overview
          </h2>
          <p className="text-slate-600 text-sm">
            Your completion score updates automatically as you complete
            activities across VidyaMitra.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-slate-200">
          <div>
            <p className="text-sm text-slate-600 mb-1">Overall completion</p>
            <p className="text-3xl font-bold text-indigo-600">
              {data.completionPercent}%
            </p>
          </div>
          <div className="flex-1">
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${data.completionPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-xl shadow p-4 border border-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
              Resume
            </p>
            <p className="text-lg font-semibold text-slate-800">
              {data.resumeUploaded ? "Uploaded" : "Not uploaded"}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
              Quizzes completed
            </p>
            <p className="text-lg font-semibold text-slate-800">
              {data.quizzesCompleted}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
              Mock interviews
            </p>
            <p className="text-lg font-semibold text-slate-800">
              {data.interviewsCompleted}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
              Training plans viewed
            </p>
            <p className="text-lg font-semibold text-slate-800">
              {data.trainingPlansViewed}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
              Roles explored
            </p>
            <p className="text-lg font-semibold text-slate-800">
              {data.suggestedRolesViewed}
            </p>
          </div>
        </div>
      </div>
    );
  }

  let tabContent = null;
  if (activeTab === "overview") tabContent = renderOverview();
  else if (activeTab === "resume") tabContent = renderResume();
  else if (activeTab === "training") tabContent = renderTraining();
  else if (activeTab === "interview") tabContent = renderInterview();
  else if (activeTab === "progress") tabContent = renderProgress();

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="font-semibold text-slate-800">VidyāMitra</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{displayName}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">
        <aside className="w-52 shrink-0">
          <nav className="bg-white rounded-xl shadow border border-slate-200 p-2 space-y-1">
            {TABS.map((tab) => {
              const active = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                    active
                      ? "bg-indigo-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1">{tabContent}</main>
      </div>
    </div>
  );
}
