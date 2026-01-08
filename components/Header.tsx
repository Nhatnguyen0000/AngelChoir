
import React from 'react';
import { Sun, Moon, Sparkles, Settings, Music2 } from 'lucide-react';
import { User, Theme } from '../types';

interface HeaderProps {
  user: User;
  theme: Theme;
  currentTab: string;
  menuItems: any[];
  springColor: string;
  onTabChange: (tab: string) => void;
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, theme, currentTab, menuItems, springColor, onTabChange, onToggleTheme }) => {
  const isSpring = theme === 'spring';

  return (
    <header className="h-20 glass-header px-8 flex items-center justify-between sticky top-0 z-[60] shadow-sm border-b border-black/5 transition-all">
      {/* Brand Section */}
      <div className="flex items-center gap-4 w-1/4">
        <div 
          style={isSpring ? { backgroundColor: springColor } : {}}
          className={`w-10 h-10 ${!isSpring ? 'bg-[#7F1D1D]' : ''} rounded-xl flex items-center justify-center text-white shadow-lg transition-all hover:rotate-3 hover:scale-105 group cursor-pointer border border-white/10`}
        >
          <Music2 size={20} className="group-hover:animate-pulse" />
        </div>
        <div className="flex flex-col">
          <h2 className="font-bold text-xl tracking-tight uppercase leading-none text-slate-900 dark:text-white">AngelChoir</h2>
          <span className="text-[8px] font-bold opacity-50 uppercase tracking-[0.3em] mt-1.5 text-slate-500">Hệ Thống Phụng Vụ</span>
        </div>
      </div>

      {/* Navigation - Optimized Pill Design */}
      <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/50 p-1 rounded-full border border-black/5 shadow-inner">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 relative group ${
                isActive 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              <Icon size={14} strokeWidth={isActive ? 3 : 2} className={isActive ? (isSpring ? `text-[${springColor}]` : 'text-[#7F1D1D]') : ''} />
              <span className={`text-[10px] font-bold tracking-[0.1em] uppercase transition-all ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Control Center */}
      <div className="flex items-center gap-3 w-1/4 justify-end">
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 text-slate-500 shadow-sm border border-black/5 hover:scale-105 active:scale-95 transition-all"
            title="Giao Diện"
          >
            {theme === 'light' && <Sun size={16} />}
            {theme === 'dark' && <Moon size={16} />}
            {theme === 'spring' && <Sparkles size={16} className="text-amber-500" />}
          </button>
          
          <button 
            onClick={() => onTabChange('settings')}
            className={`w-9 h-9 flex items-center justify-center rounded-lg shadow-sm border border-black/5 transition-all hover:scale-105 active:scale-95 ${
              currentTab === 'settings' ? 'bg-slate-900 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500'
            }`}
          >
            <Settings size={16} />
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden xl:block mx-1"></div>

        <div className="hidden xl:flex items-center gap-3 group cursor-pointer" onClick={() => onTabChange('settings')}>
          <div className="flex flex-col text-right">
            <span className="text-[11px] font-bold uppercase text-slate-900 dark:text-white leading-none mb-1">{user.fullName}</span>
            <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-[#BC8F44]">Quản trị viên</span>
          </div>
          <div 
            style={isSpring ? { backgroundColor: springColor } : {}}
            className={`w-9 h-9 rounded-lg ${!isSpring ? 'bg-slate-900' : ''} text-white flex items-center justify-center font-bold text-[10px] shadow-sm border border-white dark:border-slate-800 transition-transform group-hover:scale-105`}
          >
            {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
