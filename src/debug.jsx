import React from "react";
import { supabase } from "./lib/supabase";

export default function DebugTest() {
  const [status, setStatus] = React.useState("Checking...");

  React.useEffect(() => {
    const testSupabase = async () => {
      try {
        console.log("🔍 Testing Supabase connection...");
        const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
        
        if (error) {
          console.log("❌ Supabase test failed:", error);
          setStatus(`Error: ${error.message}`);
        } else {
          console.log("✅ Supabase connection successful");
          setStatus("✅ Supabase Connected");
        }
      } catch (err) {
        console.log("❌ Supabase connection error:", err);
        setStatus(`Connection Error: ${err.message}`);
      }
    };

    testSupabase();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{ color: '#4f46e5', fontSize: '2rem', marginBottom: '1rem' }}>
          🎓 VidyaMitra Debug
        </h1>
        
        <div style={{
          background: '#f3f4f6',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          textAlign: 'left'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Environment Check:</h3>
          <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
            VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
          </p>
          <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
            VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
          </p>
        </div>

        <div style={{
          background: status.includes('✅') ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '2rem'
        }}>
          {status}
        </div>

        <button 
          onClick={() => window.location.href = '/login'}
          style={{
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            cursor: 'pointer',
            width: '100%',
            marginBottom: '1rem'
          }}
        >
          Go to Login
        </button>

        <button 
          onClick={() => window.location.href = '/'}
          style={{
            background: '#6b7280',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Back to App
        </button>
      </div>
    </div>
  );
}
