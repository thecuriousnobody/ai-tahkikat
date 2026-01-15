import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Home, PlusCircle, Settings } from 'lucide-react';

function Layout({ children }) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/new-case', icon: PlusCircle, label: 'New Case' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <FileText className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="font-bold text-lg">Investigation</h1>
              <p className="text-xs text-gray-400">Report Platform</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;
