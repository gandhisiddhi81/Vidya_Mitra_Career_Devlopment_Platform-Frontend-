import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: Log environment variable status
console.log("🔧 Supabase Configuration Check:");
console.log("  - VITE_SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing");
console.log("  - VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✅ Set" : "❌ Missing");
console.log("  - Full URL:", supabaseUrl);

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
    console.log("✅ Creating Supabase client...");
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
    console.log("✅ Supabase client created successfully");
  } else {
    console.warn("⚠️ Supabase not configured - using noop auth");
    console.warn("Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file");
    supabase = { auth: noopAuth };
  }
} catch (e) {
  console.error("❌ Supabase init failed:", e.message);
  supabase = { auth: noopAuth };
}

export { supabase };
