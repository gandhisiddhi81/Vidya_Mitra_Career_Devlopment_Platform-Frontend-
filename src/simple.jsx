export default function SimpleTest() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <h1 style={{ 
          color: '#2d3436', 
          fontSize: '3rem', 
          marginBottom: '1rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}>
          🎓 VIDYAMITRA
        </h1>
        
        <div style={{
          background: '#00b894',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '15px',
          marginBottom: '2rem',
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}>
          ✅ FRONTEND IS WORKING!
        </div>
        
        <div style={{
          background: '#0984e3',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '15px',
          marginBottom: '2rem',
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}>
          🤖 AI SERVICES READY
        </div>
        
        <div style={{
          background: '#6c5ce7',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '15px',
          marginBottom: '2rem',
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}>
          🚀 SYSTEM ONLINE
        </div>

        <div style={{
          background: '#fdcb6e',
          color: '#2d3436',
          padding: '1rem',
          borderRadius: '10px',
          marginBottom: '2rem',
          fontSize: '1rem'
        }}>
          <strong>Time:</strong> {new Date().toLocaleString()}
        </div>

        <button 
          onClick={() => alert('React is working perfectly!')}
          style={{
            background: '#e17055',
            color: 'white',
            border: 'none',
            padding: '1.5rem 3rem',
            borderRadius: '50px',
            fontSize: '1.2rem',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: '0 10px 20px rgba(225, 112, 85, 0.3)'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          CLICK TO TEST REACT
        </button>
        
        <div style={{
          marginTop: '2rem',
          fontSize: '0.9rem',
          color: '#636e72',
          fontStyle: 'italic'
        }}>
          If you can see this page, React is working perfectly!
        </div>
      </div>
    </div>
  );
}
