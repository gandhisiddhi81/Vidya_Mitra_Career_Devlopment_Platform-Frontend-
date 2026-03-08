import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

console.log("Supabase config:", { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey });

// Stub for when Supabase is not configured - prevents white screen crash
const noopAuth = {
  getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env" } }),
  signUp: () => Promise.resolve({ data: null, error: { message: "Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env" } }),
  signOut: () => Promise.resolve(),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
};

let supabase;
try {
  if (supabaseUrl && supabaseAnonKey) {
    console.log("Creating Supabase client...");
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase client created successfully");
  } else {
    console.log("Supabase not configured - using noop auth");
    supabase = { auth: noopAuth };
  }
} catch (e) {
  console.warn("Supabase init failed:", e.message);
  supabase = { auth: noopAuth };
}

export { supabase };
