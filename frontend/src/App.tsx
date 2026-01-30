import { AppProvider } from './context/AppContext';
import ModernDashboard from './components/ModernDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ModernDashboard />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
