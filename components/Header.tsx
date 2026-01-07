
import React, { useMemo } from 'react';
import { Sun, Moon, Sparkles, Bell, ChevronRight, Cake } from 'lucide-react';
import { User, Theme } from '../types';
import { getMembers } from '../store';

interface HeaderProps {
  user: User;
  theme: Theme;
  title: string;
  springColor: string;
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, theme, title, springColor, onToggleTheme }) => {
  const members = getMembers();
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isSpring = theme === 'spring';

  // Tính toán sinh nhật trong ngày
  const todaysBirthdays = useMemo(() => {
    const today = new Date();
    const mmdd = `${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    return members.filter(m => m.ngaySinh && m.ngaySinh.endsWith(mmdd));
  }, [members]);

  return (
    <header className={`h-24 bg-white/80 dark:bg-slate-900/80 rounded-[2rem] px-8 flex items-center justify-between transition-all backdrop-blur-md sticky top-0 z-40 shadow-xl shadow-black/5 border border-white/50 dark:border-slate-800/50`}>
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-0.5">
            <span 
              style={isSpring ? { color: springColor } : {}} 
              className={`text-[8px] font-black tracking-[0.3em] uppercase opacity-70 ${!isSpring ? 'text-[#BC8F44]' : ''}`}
            >
              Hệ Thống Quản Lý Ca Đoàn
            </span>
            <ChevronRight size={10} className="opacity-40" />
          </div>
          <h1 className={`text-2xl font-black ${isSpring ? 'text-slate-800' : 'text-slate-900 dark:text-white'} tracking-tighter uppercase leading-none`}>
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleTheme}
            className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all shadow-inner border border-black/5 ${
              theme === 'light' ? 'bg-amber-50 text-amber-500 hover:bg-amber-100' : 
              theme === 'dark' ? 'bg-indigo-950 text-indigo-400 hover:bg-indigo-900' : 
              'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
            title="Đổi giao diện"
          >
            {theme === 'light' && <Sun size={20} />}
            {theme === 'dark' && <Moon size={20} />}
            {theme === 'spring' && <Sparkles size={20} />}
          </button>

          <div className="relative group">
            <button className={`w-11 h-11 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-[#BC8F44] relative border border-black/5 transition-colors ${todaysBirthdays.length > 0 ? 'animate-pulse' : ''}`}>
              <Bell size={20} />
              {todaysBirthdays.length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                  {todaysBirthdays.length}
                </div>
              )}
            </button>
            
            {/* Popover thông báo sinh nhật */}
            {todaysBirthdays.length > 0 && (
              <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-black/5 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-50 dark:border-slate-800">
                  <Cake size={14} className="text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sinh nhật hôm nay</span>
                </div>
                <div className="space-y-2">
                  {todaysBirthdays.map(m => (
                    <div key={m.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center font-black text-[10px]">
                        {m.hoTen[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-800 dark:text-white leading-none">{m.tenThanh} {m.hoTen}</span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{m.vaiTro}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className={`text-xs font-black uppercase ${isSpring ? 'text-slate-800' : 'text-slate-900 dark:text-white'} leading-none mb-1`}>
              {user.fullName}
            </span>
            <span 
              style={isSpring ? { color: springColor } : {}} 
              className={`text-[8px] font-bold uppercase tracking-widest ${!isSpring ? 'text-[#BC8F44]' : ''}`}
            >
              {user.role === 'Admin' ? 'Quản trị viên' : 'Thành viên'}
            </span>
          </div>
          <div 
            style={isSpring ? { backgroundColor: springColor } : {}} 
            className={`w-12 h-12 rounded-2xl ${!isSpring ? 'bg-[#BC8F44]' : ''} text-white flex items-center justify-center font-black text-xs shadow-lg shadow-black/10 transition-colors`}
          >
            {getInitials(user.fullName)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
