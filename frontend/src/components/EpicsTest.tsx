import { useEffect, useState } from 'react';

const EpicsTest = () => {
  const [message, setMessage] = useState('Component loaded');

  useEffect(() => {
    const testApi = async () => {
      try {
        console.log('Testing API...');
        const response = await fetch('/api/epics');
        const data = await response.json();
        console.log('API Response:', data);
        setMessage(`API working! Found ${data.length} epics`);
      } catch (err) {
        console.error('API Error:', err);
        setMessage(`API Error: ${err.message}`);
      }
    };

    testApi();
  }, []);

  return (
    <div style={{ padding: '20px', fontSize: '18px' }}>
      <h1>Frontend-Backend Connection Test</h1>
      <p style={{ color: 'blue' }}>{message}</p>
    </div>
  );
};

export default EpicsTest;