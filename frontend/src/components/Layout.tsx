import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/groups') {
      // Highlight Groups nav item when on groups, projects, milestones, or tasks pages
      return location.pathname === '/groups' ||
             location.pathname === '/projects' ||
             location.pathname === '/milestones' ||
             location.pathname === '/tasks';
    }
    return location.pathname === path;
  };

  const formatDateTime = (date: Date) => {
    const dateStr = date.toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'medium',
      hour12: false
    }).toUpperCase();

    const timezone = date.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop();

    return `${dateStr} ${timezone}`;
  };

  const userName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'User';

  return (
    <div className="flex h-screen bg-aether-bg-primary overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-aether-bg-secondary border border-aether-border-elevated p-2 text-aether-text-primary hover:bg-aether-blue-primary transition-colors"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-aether-bg-secondary border-r border-aether-border-elevated transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } flex flex-col`}
      >
        {/* Header */}
        <div className="h-16 flex items-center border-b border-aether-border-elevated px-6">
          <div className="flex items-center">
            <span className="text-aether-text-primary font-bold text-lg uppercase tracking-wider">
              AETHER
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center px-4 py-3 border ${
              location.pathname === '/'
                ? 'bg-aether-bg-elevated border-aether-blue-primary text-aether-text-primary'
                : 'border-transparent text-aether-text-muted hover:text-aether-text-primary hover:border-aether-border-elevated transition-all'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" strokeWidth={2} />
            <span className="font-sans text-xs font-bold uppercase tracking-widest">
              Dashboard
            </span>
          </Link>

          <Link
            to="/groups"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center px-4 py-3 border ${
              isActive('/groups')
                ? 'bg-aether-bg-elevated border-aether-blue-primary text-aether-text-primary'
                : 'border-transparent text-aether-text-muted hover:text-aether-text-primary hover:border-aether-border-elevated transition-all'
            }`}
          >
            <FolderOpen className="w-5 h-5 mr-3" strokeWidth={2} />
            <span className="font-sans text-xs font-bold uppercase tracking-widest">
              Groups
            </span>
          </Link>
        </nav>

        {/* User Section */}
        <div className="border-t border-aether-border-elevated p-4">
          <div className="mb-3">
            <div className="text-aether-text-primary font-sans text-xs font-bold uppercase tracking-wider truncate">
              {userName}
            </div>
            <div className="text-aether-text-muted font-mono text-[10px] uppercase tracking-widest truncate">
              {user?.email}
            </div>
            <div className="text-aether-text-muted font-mono text-[9px] uppercase tracking-widest mt-1">
              {user?.role}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 bg-aether-bg-elevated border border-aether-border-elevated text-aether-accent-danger hover:border-aether-accent-danger transition-all"
          >
            <LogOut className="w-4 h-4 mr-2" strokeWidth={2} />
            <span className="font-sans text-xs font-bold uppercase tracking-wider">
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="h-16 bg-aether-bg-secondary border-b border-aether-border-elevated flex items-center justify-between px-6">
          <div className="lg:hidden"></div>
          <div className="flex-1 lg:flex lg:justify-end">
            <div className="text-aether-text-muted font-mono text-[10px] uppercase tracking-widest">
              {formatDateTime(currentTime)}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
