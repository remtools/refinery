import { useState } from 'react';
import { useAppContext } from '../context/AppContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const Sidebar = ({ currentView, onNavigate }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { state, setSelectedProjectId } = useAppContext();
  const { projects, selectedProjectId } = state;

  const activeProject = projects.find(p => p.id === selectedProjectId);

  const navigationItems = [
    {
      id: 'projects',
      label: 'Projects',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
      badge: null,
    },
    {
      id: 'epics',
      label: 'Epics',
      disabled: !selectedProjectId,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l6 6m-6-6l6 6" />
        </svg>
      ),
      badge: null,
    },
    {
      id: 'stories',
      label: 'Stories',
      disabled: !selectedProjectId,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 19 7.5 19S10.832 18.477 12 17.753V6.253zM11.25 16.5h4.5M11.25 11.5h4.5M11.25 6.5h4.5" />
        </svg>
      ),
      badge: null,
    },
    {
      id: 'acceptance-criteria',
      label: 'Acceptance Criteria',
      disabled: !selectedProjectId,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-4h1a2 2 0 012 2v1a2 2 0 01-2 2H4a2 2 0 01-2-2v-1a2 2 0 012-2h1m6-0V7a2 2 0 012-2h1a2 2 0 012 2v6" />
        </svg>
      ),
      badge: null,
    },
    {
      id: 'test-cases',
      label: 'Test Cases',
      disabled: !selectedProjectId,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.536.536a1 1 0 01-1.414 0l-4.95 4.95a2.121 2.121 0 01-1.415 0L2.586 9.95a1 1 0 010-1.415l4.95-4.95a1 1 0 011.414 0l4.95 4.95a2.121 2.121 0 011.415 0l4.95-4.95z" />
        </svg>
      ),
      badge: null,
    },
  ];

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-full ${isCollapsed ? 'w-16' : 'w-64'
      }`}>
      {/* Header */}
      <header className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center gap-3 transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'
            }`}>
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
              RH
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-semibold text-gray-900 text-lg leading-tight">Refinery</h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Requirements Manager</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              )}
            </svg>
          </button>
        </div>

        {/* Project Selector */}
        {!isCollapsed && (
          <div className="mt-2 animate-fade-in">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
              Active Project
            </label>
            <select
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(e.target.value || null)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 transition-all outline-none"
            >
              <option value="">Select a Project...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center mt-2">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg transition-all ${activeProject ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}
              title={activeProject?.name || "No Project Selected"}
            >
              {activeProject ? activeProject.name.charAt(0) : '?'}
            </div>
          </div>
        )}
      </header>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left group ${currentView === item.id
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : item.disabled
                    ? 'text-gray-300 cursor-not-allowed opacity-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                <span className={`transition-opacity duration-200 whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
                  }`}>
                  {item.label}
                </span>
                {item.badge && (
                  <span className="ml-auto bg-error-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <footer className="border-t border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
            U
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">Test User</p>
              <p className="text-xs text-gray-500 truncate">admin@refinery.io</p>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default Sidebar;