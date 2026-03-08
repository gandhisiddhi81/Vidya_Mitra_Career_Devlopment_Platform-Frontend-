import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loading from "../components/Loading";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signUp, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <Loading />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    console.log("🔐 Starting registration process for:", email);

    if (!name.trim()) {
      setError("Name is required.");
      setSubmitting(false);
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      setSubmitting(false);
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      setSubmitting(false);
      return;
    }

    const { error: signUpError, data } = await signUp(email.trim(), password, {
      full_name: name.trim(),
    });

    console.log("📋 Registration result:", { 
      hasError: !!signUpError, 
      hasData: !!data,
      userCreated: data?.user?.id 
    });

    if (signUpError) {
      console.error("❌ Registration failed:", signUpError);
      setError(signUpError.message || "Sign up failed. Please try again.");
      setSubmitting(false);
      return;
    }

    // Check if user was created successfully
    if (data?.user) {
      console.log("✅ User created with ID:", data.user.id);
      
      // For Supabase, if no session, email confirmation is needed
      if (!data.session) {
        alert("Registration successful! Please check your email to confirm your account before logging in.");
        navigate("/login", { replace: true });
      } else {
        // User is automatically logged in
        navigate("/dashboard", { replace: true });
      }
    } else {
      // Fallback - show message and redirect
      alert("Registration successful! Please check your email to confirm your account.");
      navigate("/login", { replace: true });
    }
    
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">
          Create your account
        </h1>
        <p className="text-slate-600 text-center mb-6">
          Join VidyaMitra to start your career journey
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Your name"
              autoComplete="name"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="you@example.com"
              autoComplete="email"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-600 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
