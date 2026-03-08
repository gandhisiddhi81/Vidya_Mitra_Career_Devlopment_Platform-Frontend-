import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth and listen for changes
  useEffect(() => {
    console.log("🔐 Setting up Supabase auth...");

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("❌ Error getting session:", error);
      } else {
        console.log("✅ Session loaded:", session ? "User logged in" : "No user");
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Auth state changed:", event, session ? "User present" : "No user");
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign up with email and password
  const signUp = async (email, password) => {
    console.log("📝 Signing up:", email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("❌ Sign up error:", error);
      return { user: null, error: error.message };
    }

    console.log("✅ Sign up successful:", data.user);
    return { user: data.user, error: null };
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    console.log("🔑 Signing in:", email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("❌ Sign in error:", error);
      return { user: null, error: error.message };
    }

    console.log("✅ Sign in successful:", data.user);
    return { user: data.user, error: null };
  };

  // Sign out
  const signOut = async () => {
    console.log("🚪 Signing out...");
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("❌ Sign out error:", error);
      return { error: error.message };
    }

    console.log("✅ Signed out successfully");
    return { error: null };
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

