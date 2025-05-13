import React from 'react';
import { NavLink } from 'react-router-dom';
import { Stethoscope, LayoutDashboard, Users, Activity, LogIn } from 'lucide-react';

interface SidebarProps {
  user: any;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onSignOut }) => {
  return (
    <div className="w-64 bg-white shadow-md fixed h-full">
      <div className="p-6">
        <div className="flex items-center">
          <Stethoscope className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">ThoraScan</h1>
            <p className="text-xs text-gray-500">Diagnostic Assistant</p>
          </div>
        </div>
      </div>

      <nav className="mt-6">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 ${
              isActive ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' : ''
            }`
          }
        >
          <LayoutDashboard className="h-5 w-5 mr-3" />
          Dashboard
        </NavLink>

        <NavLink
          to="/patients"
          className={({ isActive }) =>
            `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 ${
              isActive ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' : ''
            }`
          }
        >
          <Users className="h-5 w-5 mr-3" />
          Patients
        </NavLink>

        <NavLink
          to="/analysis"
          className={({ isActive }) =>
            `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 ${
              isActive ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' : ''
            }`
          }
        >
          <Activity className="h-5 w-5 mr-3" />
          Analysis
        </NavLink>
      </nav>

      <div className="absolute bottom-0 w-64 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {user.email?.[0].toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user.email}</p>
              <p className="text-xs text-gray-500">Doctor</p>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="text-gray-400 hover:text-gray-600"
          >
            <LogIn className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
