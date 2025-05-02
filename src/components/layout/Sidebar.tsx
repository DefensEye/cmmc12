import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  Settings,
  BarChart3,
  Shield,
  HelpCircle,
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/',
    },
    {
      icon: FileText,
      label: 'Upload Findings',
      href: '/upload',
    },
    {
      icon: Shield,
      label: 'CMMC Compliance',
      href: '/compliance',
    },
    {
      icon: BarChart3,
      label: 'Analysis',
      href: '/analysis',
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/settings',
    },
    {
      icon: HelpCircle,
      label: 'Help',
      href: '/help',
    },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <div className="text-2xl font-bold text-blue-600">
            CMMC
            <span className="text-gray-600">Compliance</span>
          </div>
          <div className="text-sm text-gray-500">Level 1 Assessment</div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
