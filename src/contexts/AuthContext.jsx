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
  const [loading, setLoading] = useState(false); // Start with false

  useEffect(() => {
    console.log("🔍 Initializing Supabase Auth...");
    
    // Check current session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Session error:", error);
        } else {
          console.log("✅ Session retrieved:", !!session?.user);
          setUser(session?.user || null);
        }
      } catch (err) {
        console.error("❌ Auth initialization error:", err);
        setUser(null);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Auth state changed:", event, !!session?.user);
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      console.log("🔑 Attempting sign in...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Sign in error:", error);
        return { data: null, error };
      }

      if (data?.user) {
        setUser(data.user);
        console.log("✅ Sign in successful");
      }

      return { data, error: null };
    } catch (error) {
      console.error("❌ Sign in failed:", error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    setLoading(true);
    try {
      console.log("📝 Attempting sign up with:", { email, hasMetadata: !!Object.keys(metadata).length });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });

      console.log("📬 Sign up response:", { 
        hasUser: !!data?.user, 
        hasSession: !!data?.session,
        userId: data?.user?.id,
        error: error?.message 
      });

      if (error) {
        console.error("❌ Sign up error:", error);
        return { data: null, error };
      }

      if (data?.user) {
        setUser(data.user);
        console.log("✅ Sign up successful, user ID:", data.user.id);
        
        // Check if email confirmation is required
        if (!data.session) {
          console.log("📧 Email confirmation required");
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error("❌ Sign up failed with exception:", error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log("🚪 Signing out...");
      await supabase.auth.signOut();
      setUser(null);
      console.log("✅ Sign out successful");
    } catch (error) {
      console.error("❌ Sign out error:", error);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

