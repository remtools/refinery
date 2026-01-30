import { useEffect, useState } from 'react';

const MinimalTest = () => {
  const [data, setData] = useState<string>('Loading...');

  useEffect(() => {
    // Test basic React rendering
    setTimeout(() => {
      setData('React component is working!');
    }, 1000);

    // Test API call
    fetch('/api/epics')
      .then(res => res.json())
      .then(epics => {
        console.log('Epics from API:', epics);
        setData(`Found ${epics.length} epics`);
      })
      .catch(err => {
        console.error('API Error:', err);
        setData('API call failed');
      });
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
      <h1 style={{ color: '#333' }}>Minimal Test Component</h1>
      <p style={{ color: '#666', fontSize: '18px' }}>Status: {data}</p>
    </div>
  );
};

export default MinimalTest;