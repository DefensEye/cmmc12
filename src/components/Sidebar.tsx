import React from 'react';
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  Settings,
  ChevronRight,
  ChevronLeft,
  Shield,
  Puzzle,
  Cloud,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSettingsClick: () => void;
  hasUploadedFile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  activeTab,
  onTabChange,
  onSettingsClick,
  hasUploadedFile
}) => {
  const mainNavItems = [
    { id: 'upload', label: 'Upload Data', icon: Upload },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, disabled: !hasUploadedFile },
    { id: 'report', label: 'AI Report', icon: FileText, disabled: !hasUploadedFile },
    { id: 'get-insights', label: 'Get Insights', icon: Shield }
  ];

  const cloudItems = [
    { id: 'google-cmmc', label: 'Google CMMC', icon: Cloud },
  ];

  const integrationItems = [
    { id: 'google-cloud', label: 'Google Cloud', icon: Cloud, onClick: onSettingsClick },
  ];

  const renderNavItems = (items: any[], sectionTitle?: string) => (
    <div className="space-y-1">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)} // Ensure this updates the active tab
          disabled={item.disabled}
          className={`w-full flex items-center px-4 py-3 text-sm ${
            activeTab === item.id
              ? 'text-blue-600 bg-blue-50'
              : item.disabled
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {React.createElement(item.icon, { className: 'h-5 w-5' })}
          {!isCollapsed && <span className="ml-3">{item.label}</span>}
        </button>
      ))}
    </div>
  );

  return (
    <div 
      className={`bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-40 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-blue-600" />
          {!isCollapsed && (
            <span className="ml-2 font-semibold text-gray-900">CMMC Dashboard</span>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="py-4 space-y-4">
        {renderNavItems(mainNavItems)}

        <div className="pt-4 border-t border-gray-200">
          {renderNavItems(cloudItems, 'CMMC Compliance Readiness')}
        </div>

        {/* Integrations Section */}
        <div className="pt-4 border-t border-gray-200">
          {renderNavItems(integrationItems, 'Integrations')}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute bottom-4 right-4 p-2 rounded-full hover:bg-gray-100"
      >
        {isCollapsed ? (
          <ChevronRight className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        )}
      </button>
    </div>
  );
};

export default Sidebar;