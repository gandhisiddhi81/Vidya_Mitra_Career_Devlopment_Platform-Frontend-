import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { fetchQuizQuestions, submitQuizAnswers } from "../api/quiz";
import Loading from "../components/Loading";
import ErrorBoundary from "../components/ErrorBoundary";

const OPTION_LABELS = ["A", "B", "C", "D"];

// 10+ realistic role labels, mapped onto the 4 backend quiz domains.
const ROLE_OPTIONS = [
  { id: "software-engineer", label: "Software Engineer", backendRole: "software-engineer" },
  { id: "frontend-developer", label: "Frontend Developer", backendRole: "software-engineer" },
  { id: "backend-developer", label: "Backend Developer", backendRole: "software-engineer" },
  { id: "fullstack-developer", label: "Full‑stack Developer", backendRole: "software-engineer" },
  { id: "mobile-developer", label: "Mobile App Developer", backendRole: "software-engineer" },
  { id: "data-scientist", label: "Data Scientist", backendRole: "data-scientist" },
  { id: "data-analyst", label: "Data Analyst", backendRole: "data-scientist" },
  { id: "ml-engineer", label: "Machine Learning Engineer", backendRole: "data-scientist" },
  { id: "product-manager", label: "Product Manager", backendRole: "product-manager" },
  { id: "product-owner", label: "Product Owner", backendRole: "product-manager" },
  { id: "ux-designer", label: "UX Designer", backendRole: "ux-designer" },
  { id: "ui-ux-designer", label: "UI/UX Designer", backendRole: "ux-designer" },
  { id: "devops-engineer", label: "DevOps Engineer", backendRole: "software-engineer" },
  { id: "cloud-architect", label: "Cloud Architect", backendRole: "software-engineer" },
  { id: "data-engineer", label: "Data Engineer", backendRole: "data-scientist" },
  {
    id: "custom",
    label: "Custom role (generic tech quiz)",
    backendRole: "software-engineer",
  },
];

export default function QuizPage() {
  const { role: roleParam } = useParams();
  const { search } = useLocation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Check for custom role in URL query params
  const searchParams = new URLSearchParams(search);
  const customRoleFromUrl = searchParams.get('role');

  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(() => {
    // If custom role in URL, use custom
    if (customRoleFromUrl) return "custom";
    if (!roleParam) return ROLE_OPTIONS[0].id;
    const found = ROLE_OPTIONS.find(
      (r) => r.id === roleParam || r.backendRole === roleParam
    );
    return found ? found.id : ROLE_OPTIONS[0].id;
  });
  const [customRoleLabel, setCustomRoleLabel] = useState(() => customRoleFromUrl || "");
  const [submitting, setSubmitting] = useState(false);

  const selectedRole = useMemo(
    () =>
      ROLE_OPTIONS.find((r) => r.id === selectedRoleId) || ROLE_OPTIONS[0],
    [selectedRoleId]
  );

  // Use custom role label as backend role if custom is selected
  const effectiveBackendRole = selectedRoleId === "custom" && customRoleLabel.trim()
    ? customRoleLabel.trim()
    : selectedRole.backendRole;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchQuizQuestions(effectiveBackendRole);
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setQuestions(data);
          setCurrentIndex(0);
          setSelectedAnswer(null);
          setAnswers([]);
        } else if (!cancelled) {
          setError("No questions found for this role.");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load questions.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [effectiveBackendRole]);

  if (authLoading) return <Loading />;

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  if (loading) return <Loading />;

  if (error || !questions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{error || "Something went wrong."}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];
  if (!question) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const isLast = currentIndex === questions.length - 1;

  async function handleNext() {
    if (selectedAnswer === null) return;

    const q = questions[currentIndex];
    const correctAnswerIndex = q.options?.indexOf(q.correctAnswer);
    const correct = selectedAnswer === ['A', 'B', 'C', 'D'][correctAnswerIndex];
    const newAnswers = [...answers, { selected: selectedAnswer, correct }];

    if (isLast) {
      const correctCount = newAnswers.filter((a) => a.correct).length;
      const score = correctCount * 10;
      
      // Submit quiz results to backend
      try {
        setSubmitting(true);
        const answerData = newAnswers.map(a => ({
          question: questions[newAnswers.indexOf(a)].question,
          selectedAnswer: a.selected,
          isCorrect: a.correct
        }));
        
        await submitQuizAnswers(user.id, effectiveBackendRole, answerData, score);
      } catch (error) {
        console.error("Failed to submit quiz:", error);
        // Still navigate to results even if submission fails
      }
      
      navigate("/results", {
        replace: true,
        state: {
          score,
          correctCount,
          wrongCount: 10 - correctCount,
        },
      });
      return;
    }

    setAnswers(newAnswers);
    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
  }

  const displayRoleName =
    selectedRole.id === "custom"
      ? customRoleLabel.trim() || selectedRole.label
      : selectedRole.label;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Role quiz
              </p>
              <p className="font-semibold text-slate-800">
                {displayRoleName}
              </p>
            </div>
            <p className="text-sm text-slate-600">
              Question {currentIndex + 1} / {questions.length}
            </p>
          </div>
        </nav>

        <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Select your role
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => {
                  setSelectedRoleId(e.target.value);
                  setSelectedAnswer(null);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedRoleId === "custom" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Custom role name
                </label>
                <input
                  type="text"
                  value={customRoleLabel}
                  onChange={(e) => setCustomRoleLabel(e.target.value)}
                  placeholder="e.g. Cloud Architect, Security Engineer"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Quiz questions will use a generic tech set, but results will
                  be labeled with your custom role.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">
              {question.question}
            </h2>

            <div className="space-y-3">
              {OPTION_LABELS.map((label, idx) => {
                const option = question.options?.[idx];
                if (option == null) return null;
                const isSelected = selectedAnswer === label;
                return (
                  <button
                    key={label}
                    onClick={() => setSelectedAnswer(label)}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="font-medium text-slate-800">{label}.</span>{" "}
                    {option}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNext}
              disabled={selectedAnswer === null || submitting}
              className="mt-6 w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : (isLast ? "Finish Quiz" : "Next")}
            </button>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
