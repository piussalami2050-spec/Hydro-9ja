import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ color: '#3b82f6', fontSize: '2rem', marginBottom: '20px' }}>
        🎉 Hydro Naija - Test Version
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
        ✅ If you can see this, React is working!
      </p>
      <p style={{ color: '#10b981' }}>
        The app is loading successfully. Now we'll add the full features back.
      </p>
      <button 
        onClick={() => alert('Button works!')}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '15px 30px',
          fontSize: '1rem',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Click to Test
      </button>
    </div>
  );
}

export default App;
