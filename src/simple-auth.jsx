import React, { useState } from "react";

export default function SimpleAuth() {
  const [showLogin, setShowLogin] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate successful login
    setShowDashboard(true);
  };

  const handleRegister = () => {
    // Simulate successful registration
    setShowDashboard(true);
  };

  if (showDashboard) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'system-ui, sans-serif',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <h1 style={{ 
              color: '#4f46e5', 
              fontSize: '2rem',
              margin: 0
            }}>
              🎓 VidyaMitra Dashboard
            </h1>
            <button 
              onClick={() => setShowDashboard(false)}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{
              background: '#10b981',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>📄 Resume Analysis</h3>
              <p style={{ margin: 0 }}>AI-powered resume evaluation</p>
            </div>
            
            <div style={{
              background: '#3b82f6',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>🎯 Role Matching</h3>
              <p style={{ margin: 0 }}>Find your perfect career match</p>
            </div>
            
            <div style={{
              background: '#8b5cf6',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>📚 Training Plans</h3>
              <p style={{ margin: 0 }}>Personalized learning paths</p>
            </div>
            
            <div style={{
              background: '#f59e0b',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>📝 Quiz Generator</h3>
              <p style={{ margin: 0 }}>Dynamic quiz creation</p>
            </div>
            
            <div style={{
              background: '#ef4444',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>🎤 Mock Interviews</h3>
              <p style={{ margin: 0 }}>Practice with AI</p>
            </div>
            
            <div style={{
              background: '#06b6d4',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>📊 Progress Tracking</h3>
              <p style={{ margin: 0 }}>Monitor your growth</p>
            </div>
          </div>
          
          <div style={{
            background: '#f3f4f6',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginTop: '2rem',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>✅ System Status</h3>
            <p style={{ margin: 0, color: '#6b7280' }}>
              Frontend: Running | Backend: Connected | AI Services: Active | User: {email || 'Demo User'}
            </p>
          </div>
        </div>
      </div>
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
        maxWidth: '400px'
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
                style={{
                  background: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Sign In
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
            
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Register
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
