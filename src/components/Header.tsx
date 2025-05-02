import React, { useState } from 'react';
import { Shield, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from './AuthContext';
import { signOutUser } from '../services/firebaseService';

/**
 * Props interface for the Header component
 */
interface HeaderProps {
  /** Callback function triggered when the settings button is clicked */
  onSettingsClick: () => void;
}

/**
 * Header component that displays the application title and settings button
 * 
 * @param onSettingsClick - Function to call when settings button is clicked
 */
const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  // Get current user from auth context
  const { currentUser } = useAuth();
  
  // State for user dropdown menu
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  /**
   * Handles user sign out
   */
  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and title section */}
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900">CMMC Level 3 Compliance Dashboard</h1>
              <p className="text-sm text-gray-500">Powered by DefenseEye AI</p>
            </div>
          </div>
          
          {/* User info and actions */}
          <div className="flex items-center space-x-4">
            {/* User info with dropdown */}
            {currentUser && (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md p-1"
                >
                  <div className="flex items-center">
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt="User avatar" 
                        className="h-8 w-8 rounded-full mr-2"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                    <span className="hidden md:inline-block mr-1">
                      {currentUser.displayName || currentUser.email}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </div>
                </button>
                
                {/* Dropdown menu */}
                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5"
                    onBlur={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      Signed in as<br />
                      <span className="font-medium">{currentUser.email}</span>
                    </div>
                    <button
                      onClick={onSettingsClick}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      API Settings
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Settings button (only shown when user dropdown is not available) */}
            {!currentUser && (
              <button 
                onClick={onSettingsClick}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                title="API Settings"
              >
                <Settings className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;