import { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('https://deskflow-backend-omq7.onrender.com/bfhl')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch');
        }
        return res.json();
      })
      .then((result) => {
        setData(result);
      })
      .catch((err) => {
        console.error(err);
        setError('Backend connection failed');
      });
  }, []);

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        minHeight: '100vh',
        color: 'white',
        padding: '40px',
        fontFamily: 'Arial'
      }}
    >
      <h1 style={{ color: '#6366f1' }}>DeskFlow</h1>
      <h3>BFHL Backend Connected ✅</h3>

      {error && (
        <div
          style={{
            background: '#7f1d1d',
            padding: '10px',
            borderRadius: '8px',
            marginTop: '20px'
          }}
        >
          {error}
        </div>
      )}

      {data && (
        <div
          style={{
            background: '#1e293b',
            padding: '20px',
            borderRadius: '10px',
            marginTop: '20px'
          }}
        >
          <h2>API Response</h2>

          <pre
            style={{
              overflowX: 'auto',
              whiteSpace: 'pre-wrap'
            }}
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
