
import React from 'react';
import { Sun, Moon, Search, Sparkles } from 'lucide-react';
import { User, Theme } from '../types';

interface HeaderProps {
  user: User;
  theme: Theme;
  title: string;
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, theme, title, onToggleTheme }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="h-24 bg-white/80 dark:bg-slate-900/80 spring:bg-white border-b border-slate-200 dark:border-slate-800 spring:border-red-100 px-8 flex items-center justify-between transition-all backdrop-blur-md sticky top-0 z-40">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          {theme === 'spring' && <Sparkles size={18} className="text-red-600" />}
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h1>
        </div>
        <p className="text-xs font-bold text-slate-400 spring:text-red-400 uppercase tracking-widest mt-1">AngelChoir Digital Portal</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center relative">
          <Search className="absolute left-4 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Nội dung, thành viên, bài hát..." 
            className="pl-12 pr-6 py-3 bg-slate-100 dark:bg-slate-800 spring:bg-red-50/50 rounded-2xl text-sm border-none focus:ring-2 focus:ring-red-500 w-80 transition-all outline-none"
          />
        </div>

        <button 
          onClick={onToggleTheme}
          className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 spring:hover:bg-red-50 text-slate-500 spring:text-red-600 transition-colors"
          title="Đổi giao diện"
        >
          {theme === 'light' ? <Moon size={22} /> : (theme === 'dark' ? <Sun size={22} /> : <Sparkles size={22} />)}
        </button>

        <div className="flex items-center gap-4 pl-6 border-l border-slate-200 dark:border-slate-800 spring:border-red-100">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-bold text-slate-900 dark:text-white spring:text-red-700 leading-tight">{user.fullName}</span>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{user.role}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-red-500/20">
            {getInitials(user.fullName)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
