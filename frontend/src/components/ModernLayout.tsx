import { useState, ReactNode } from 'react';
import Sidebar from './Sidebar';

interface ModernLayoutProps {
  children: ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
  selectedEpicId?: string | null;
  selectedStoryId?: string | null;
  selectedAcId?: string | null;
}

const ModernLayout = ({ children, currentView, onNavigate, selectedEpicId, selectedStoryId, selectedAcId }: ModernLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block flex-shrink-0`}>
        <Sidebar
          currentView={currentView}
          onNavigate={onNavigate}
          selectedEpicId={selectedEpicId}
          selectedStoryId={selectedStoryId}
          selectedAcId={selectedAcId}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Refinery</h1>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto flex flex-col">
          {children}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ModernLayout;