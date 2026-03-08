import React from "react";

export default function TestDashboard() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        background: 'white',
        margin: '2rem',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          color: '#4f46e5', 
          fontSize: '2.5rem',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          🎓 VidyaMitra Dashboard
        </h1>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem'
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
          <p style={{ margin: '0', color: '#6b7280' }}>
            Frontend: Running | Backend: Connected | AI Services: Active
          </p>
        </div>
      </div>
    </div>
  );
}
