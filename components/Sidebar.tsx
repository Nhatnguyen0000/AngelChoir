
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  Music,
  HelpCircle,
  Music4,
  Award
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'members', icon: Users, label: 'Thành viên' },
    { id: 'schedules', icon: Calendar, label: 'Phụng vụ' },
    { id: 'songs', icon: Music, label: 'Thư viện nhạc' },
    { id: 'reports', icon: BarChart3, label: 'Thống kê' },
  ];

  return (
    <aside className="w-20 md:w-28 bg-white dark:bg-slate-900 spring:bg-red-700 border-r border-slate-200 dark:border-slate-800 spring:border-red-600 flex flex-col py-8 items-center transition-all duration-300 shadow-xl z-50">
      <div className="mb-12 text-blue-600 dark:text-blue-500 spring:text-yellow-400">
        <Music4 size={40} strokeWidth={2.5} />
      </div>

      <nav className="flex-1 flex flex-col gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`p-4 rounded-2xl transition-all relative group ${
                isActive 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 spring:bg-yellow-400 spring:text-red-700 spring:shadow-lg spring:shadow-yellow-400/20' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 spring:text-red-200 spring:hover:text-white'
              }`}
              title={item.label}
            >
              <Icon size={26} />
              <span className="absolute left-full ml-4 px-3 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 spring:bg-yellow-400 rounded-l-full"></div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="flex flex-col gap-6 mt-auto">
        <button className="p-4 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 spring:text-red-200 spring:hover:text-white transition-all relative group">
          <Award size={26} />
          <span className="absolute left-full ml-4 px-3 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
            Vinh danh
          </span>
        </button>
        <button className="p-4 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 spring:text-red-200 spring:hover:text-white transition-all relative group">
          <Settings size={26} />
          <span className="absolute left-full ml-4 px-3 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
            Cài đặt
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
