import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

export default function RealAuth() {
  const [showLogin, setShowLogin] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setShowDashboard(true);
      }
    };
    checkSession();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      setUser(data.user);
      setShowDashboard(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Sign up user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            full_name: name,
          }
        }
      });

      if (error) throw error;
      
      // Create user profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            name: name,
            email: email,
            created_at: new Date().toISOString()
          }
        ]);

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }

      setUser(data.user);
      setShowDashboard(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowDashboard(false);
    setName("");
    setEmail("");
    setPassword("");
  };

  const Sidebar = () => (
    <div style={{
      width: '250px',
      background: '#1f2937',
      color: 'white',
      padding: '1.5rem',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0
    }}>
      <h2 style={{ margin: '0 0 2rem 0', fontSize: '1.5rem' }}>🎓 VidyaMitra</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{
          padding: '0.75rem',
          background: '#374151',
          borderRadius: '0.5rem',
          cursor: 'pointer'
        }}>
          📊 Overview
        </div>
        <div style={{
          padding: '0.75rem',
          borderRadius: '0.5rem',
          cursor: 'pointer'
        }}>
          📄 Resume Analysis
        </div>
        <div style={{
          padding: '0.75rem',
          borderRadius: '0.5rem',
          cursor: 'pointer'
        }}>
          🎯 Role Matching
        </div>
        <div style={{
          padding: '0.75rem',
          borderRadius: '0.5rem',
          cursor: 'pointer'
        }}>
          📚 Training Plans
        </div>
        <div style={{
          padding: '0.75rem',
          borderRadius: '0.5rem',
          cursor: 'pointer'
        }}>
          📝 Quiz Generator
        </div>
        <div style={{
          padding: '0.75rem',
          borderRadius: '0.5rem',
          cursor: 'pointer'
        }}>
          🎤 Mock Interviews
        </div>
        <div style={{
          padding: '0.75rem',
          borderRadius: '0.5rem',
          cursor: 'pointer'
        }}>
          📊 Progress Tracking
        </div>
      </div>
      
      <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
        <div style={{
          padding: '0.75rem',
          background: '#374151',
          borderRadius: '0.5rem',
          marginBottom: '0.5rem'
        }}>
          👤 {user?.user_metadata?.name || user?.email}
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );

  const Dashboard = () => {
    const [apiData, setApiData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Fetch real data from backend APIs
      const fetchApiData = async () => {
        try {
          // Test AI providers
          const providersResponse = await fetch('http://localhost:8000/api/ai/providers');
          const providers = await providersResponse.json();
          
          // Test resume analysis
          const resumeResponse = await fetch('http://localhost:8000/api/ai/analyze-resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: "Sample resume text for testing",
              provider: "auto"
            })
          });
          const resumeData = await resumeResponse.json();

          setApiData({
            providers,
            resumeAnalysis: resumeData,
            timestamp: new Date().toLocaleString()
          });
        } catch (error) {
          console.error("API fetch error:", error);
          setApiData({ error: error.message });
        } finally {
          setLoading(false);
        }
      };

      fetchApiData();
    }, []);

    return (
      <div style={{ marginLeft: '250px', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Dashboard Overview</h1>
        
        {loading ? (
          <div>Loading data from AI services...</div>
        ) : apiData?.error ? (
          <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '0.5rem', color: '#dc2626' }}>
            API Error: {apiData.error}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>🤖 AI Services Status</h3>
              <div style={{ color: '#6b7280' }}>
                <p>Gemini: {apiData?.providers?.gemini ? '✅ Active' : '❌ Inactive'}</p>
                <p>Grok: {apiData?.providers?.grok ? '✅ Active' : '❌ Inactive'}</p>
                <p>OpenAI: {apiData?.providers?.openai ? '✅ Active' : '❌ Inactive'}</p>
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>📄 Latest Resume Analysis</h3>
              <div style={{ color: '#6b7280' }}>
                <p>Status: {apiData?.resumeAnalysis?.success ? '✅ Completed' : '⏳ Pending'}</p>
                <p>Provider: {apiData?.resumeAnalysis?.provider || 'Auto-selected'}</p>
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>👤 User Profile</h3>
              <div style={{ color: '#6b7280' }}>
                <p>Name: {user?.user_metadata?.name || 'N/A'}</p>
                <p>Email: {user?.email}</p>
                <p>ID: {user?.id?.substring(0, 8)}...</p>
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>📊 System Info</h3>
              <div style={{ color: '#6b7280' }}>
                <p>Last Updated: {apiData?.timestamp}</p>
                <p>Backend: http://localhost:8000</p>
                <p>Database: Supabase Connected</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (showDashboard) {
    return (
      <>
        <Sidebar />
        <Dashboard />
      </>
    );
  }

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
        padding: '3rem',
        borderRadius: '1rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '450px'
      }}>
        <h1 style={{ 
          color: '#4f46e5', 
          fontSize: '2rem',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          🎓 VidyaMitra
        </h1>
        
        {showLogin ? (
          <>
            <h2 style={{ 
              color: '#374151', 
              fontSize: '1.5rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              Sign In
            </h2>
            
            {error && (
              <div style={{
                background: '#fef2f2',
                color: '#dc2626',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? '#9ca3af' : '#4f46e5',
                  color: 'white',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            
            <p style={{ 
              textAlign: 'center', 
              marginTop: '2rem', 
              color: '#6b7280' 
            }}>
              Don't have an account?{' '}
              <button 
                onClick={() => setShowLogin(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4f46e5',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Register
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 style={{ 
              color: '#374151', 
              fontSize: '1.5rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              Register
            </h2>
            
            {error && (
              <div style={{
                background: '#fef2f2',
                color: '#dc2626',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </form>
            
            <p style={{ 
              textAlign: 'center', 
              marginTop: '2rem', 
              color: '#6b7280' 
            }}>
              Already have an account?{' '}
              <button 
                onClick={() => setShowLogin(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4f46e5',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Sign In
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
