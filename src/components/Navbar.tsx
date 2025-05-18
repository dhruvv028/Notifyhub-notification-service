import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bell } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center">
              <Bell className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-bold text-white">NotifyHub</span>
            </NavLink>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                    isActive 
                      ? 'bg-indigo-800 text-white' 
                      : 'text-white hover:bg-indigo-500 hover:bg-opacity-75'
                  }`
                }
                end
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/send" 
                className={({ isActive }) => 
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                    isActive 
                      ? 'bg-indigo-800 text-white' 
                      : 'text-white hover:bg-indigo-500 hover:bg-opacity-75'
                  }`
                }
              >
                Send Notification
              </NavLink>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu - visible on small screens */}
      <div className="md:hidden border-t border-indigo-500">
        <div className="flex justify-center space-x-1 px-2 py-3">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `px-3 py-2 rounded-md text-sm font-medium ${
                isActive 
                  ? 'bg-indigo-800 text-white' 
                  : 'text-white hover:bg-indigo-500'
              }`
            }
            end
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/send" 
            className={({ isActive }) => 
              `px-3 py-2 rounded-md text-sm font-medium ${
                isActive 
                  ? 'bg-indigo-800 text-white' 
                  : 'text-white hover:bg-indigo-500'
              }`
            }
          >
            Send Notification
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;