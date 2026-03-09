import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Log what we have (without exposing keys)
console.log("Supabase config check:", {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey
});

// Create a noop auth fallback to prevent white screen
const noopAuth = {
  getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  signInWithPassword: () => Promise.resolve({ 
    data: null, 
    error: { message: "Supabase not configured. Please contact admin." } 
  }),
  signUp: () => Promise.resolve({ 
    data: null, 
    error: { message: "Supabase not configured. Please contact admin." } 
  }),
  signOut: () => Promise.resolve(),
  onAuthStateChange: () => ({ 
    data: { subscription: { unsubscribe: () => {} } } 
  }),
  getUser: () => Promise.resolve({ data: { user: null }, error: null })
};

let supabase;

if (supabaseUrl && supabaseAnonKey) {
  try {
    console.log("Creating Supabase client...");
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    console.log("✅ Supabase client created successfully");
  } catch (err) {
    console.error("❌ Failed to create Supabase client:", err);
    supabase = { auth: noopAuth };
  }
} else {
  console.warn("⚠️ Supabase environment variables not set - using noop auth");
  console.warn("Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file");
  supabase = { auth: noopAuth };
}

export { supabase };

