import React from 'react';
import { NavLink } from 'react-router-dom';
import { Stethoscope, LayoutDashboard, Users, Activity, LogIn } from 'lucide-react';

interface SidebarProps {
  user: any;
  onSignOut: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onSignOut, isOpen, onClose }) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-gray-900 text-gray-100 w-64 transform transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center">
            <Stethoscope className="h-8 w-8 text-blue-400 mr-3" />
            <div>
              <h1 className="text-xl font-bold text-white">ThoraScan</h1>
              <p className="text-xs text-gray-400">Diagnostic Assistant</p>
            </div>
          </div>
        </div>

        <nav className="mt-6">
          <NavLink
            to="/"
            end
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
                isActive ? 'bg-gray-800 text-white border-l-4 border-blue-500' : ''
              }`
            }
          >
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Dashboard
          </NavLink>

          <NavLink
            to="/patients"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
                isActive ? 'bg-gray-800 text-white border-l-4 border-blue-500' : ''
              }`
            }
          >
            <Users className="h-5 w-5 mr-3" />
            Patients
          </NavLink>

          <NavLink
            to="/analysis"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
                isActive ? 'bg-gray-800 text-white border-l-4 border-blue-500' : ''
              }`
            }
          >
            <Activity className="h-5 w-5 mr-3" />
            Analysis
          </NavLink>
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user.email?.[0].toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-200">{user.email}</p>
                <p className="text-xs text-gray-400">Doctor</p>
              </div>
            </div>
            <button
              onClick={onSignOut}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <LogIn className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;