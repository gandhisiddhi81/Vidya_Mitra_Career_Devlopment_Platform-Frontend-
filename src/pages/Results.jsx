import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loading from "../components/Loading";

export default function Results() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const state = location?.state;

  if (loading) return <Loading />;

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  const score = typeof state?.score === "number" ? state.score : 0;
  const correctCount = typeof state?.correctCount === "number" ? state.correctCount : 0;
  const wrongCount = typeof state?.wrongCount === "number" ? state.wrongCount : 0;

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Quiz Completed
        </h1>

        <div className="my-8">
          <p className="text-5xl font-bold text-indigo-600 mb-2">
            {score} / 100
          </p>
          <p className="text-slate-600">Score</p>
        </div>

        <div className="space-y-4 text-left">
          <div className="flex justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-slate-700">Correct Answers</span>
            <span className="font-semibold text-green-700">{correctCount}</span>
          </div>
          <div className="flex justify-between p-3 bg-red-50 rounded-lg">
            <span className="text-slate-700">Wrong Answers</span>
            <span className="font-semibold text-red-700">{wrongCount}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            to="/dashboard"
            className="block py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
          >
            Start Another Quiz
          </Link>
          <Link
            to="/dashboard"
            className="block py-3 px-4 text-indigo-600 font-medium hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
