
import React, { useState, useEffect, useMemo } from 'react';
import { getCurrentUser, getSpringColor } from './store';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Schedules from './pages/Schedules';
import Songs from './pages/Songs';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { Theme } from './types';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Music, 
  BarChart2, 
  Settings as SettingsIcon,
  Sun,
  Moon,
  Sparkles,
  Bell,
  ChevronRight,
  Music2
} from 'lucide-react';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  const [springColor, setSpringColor] = useState(getSpringColor());
  const user = getCurrentUser();

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleColorChange = (e: any) => {
      setSpringColor(e.detail || getSpringColor());
    };
    window.addEventListener('springColorChange', handleColorChange);
    return () => window.removeEventListener('springColorChange', handleColorChange);
  }, []);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'BẢNG ĐIỀU KHIỂN' },
    { id: 'members', icon: Users, label: 'QUẢN LÝ CA VIÊN' },
    { id: 'schedules', icon: Calendar, label: 'LỊCH PHỤNG VỤ' },
    { id: 'songs', icon: Music, label: 'THƯ VIỆN NHẠC' },
    { id: 'reports', icon: BarChart2, label: 'BÁO CÁO THỐNG KÊ' },
  ];

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('spring');
    else setTheme('light');
  };

  const styles = useMemo(() => {
    const base = {
      light: {
        bg: 'bg-[#F1F5F9]',
        sidebar: 'bg-[#0F172A]',
        panel: 'bg-white',
        textPrimary: 'text-[#0F172A]',
        accent: '#BC8F44'
      },
      dark: {
        bg: 'bg-[#020617]',
        sidebar: 'bg-[#0F172A]',
        panel: 'bg-[#0F172A]',
        textPrimary: 'text-white',
        accent: '#3B82F6'
      },
      spring: {
        bg: 'bg-[#FFFBEB]',
        sidebar: springColor,
        panel: 'bg-white',
        textPrimary: `text-[${springColor}]`,
        accent: '#D97706'
      }
    }[theme];
    return base;
  }, [theme, springColor]);

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard': return <Dashboard />;
      case 'members': return <Members />;
      case 'schedules': return <Schedules />;
      case 'songs': return <Songs />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className={`flex h-screen ${styles.bg} p-4 md:p-5 gap-5 font-sans overflow-hidden transition-all duration-500`}>
      {/* Sidebar Tinh Chỉnh */}
      <aside 
        style={theme === 'spring' ? { backgroundColor: springColor } : {}}
        className={`w-20 lg:w-72 ${theme !== 'spring' ? styles.sidebar : ''} rounded-[2.5rem] flex flex-col py-10 shadow-2xl shrink-0 transition-all duration-500 z-50`}
      >
        {/* Logo Section - Căn chỉnh hài hòa */}
        <div className="flex items-center gap-4 mb-14 px-7 self-center lg:self-start">
          <div className="w-11 h-11 bg-white/15 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/10">
            <Music2 size={22} />
          </div>
          <div className="hidden lg:block text-white">
            <h2 className="font-black text-xl tracking-tighter uppercase leading-none">AngelChoir</h2>
            <p className="text-[7px] font-black opacity-40 uppercase tracking-[0.3em] mt-1.5">Premium Portal</p>
          </div>
        </div>

        {/* Navigation - Khoảng cách gap-3 tối ưu */}
        <nav className="flex-1 flex flex-col gap-3 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`group flex items-center justify-center lg:justify-start gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 relative ${
                  isActive 
                  ? 'bg-white text-slate-900 shadow-xl shadow-black/10' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon 
                  size={20} 
                  style={isActive && theme === 'spring' ? { color: springColor } : {}} 
                  className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                />
                <span className={`hidden lg:block text-xs font-black tracking-widest leading-none whitespace-nowrap transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
                  {item.label}
                </span>
                
                {/* Active Indicator cho Mobile */}
                {isActive && (
                  <div className="lg:hidden absolute left-0 w-1 h-6 bg-white rounded-r-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Section (Settings) */}
        <div className="mt-auto px-3 pt-6 border-t border-white/10">
           <button 
             onClick={() => setCurrentTab('settings')}
             className={`w-full flex items-center justify-center lg:justify-start gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 ${
               currentTab === 'settings' 
               ? 'bg-white text-slate-900 shadow-xl shadow-black/10' 
               : 'text-white/40 hover:text-white hover:bg-white/5'
             }`}
           >
              <SettingsIcon size={20} className={currentTab === 'settings' ? 'animate-spin-slow' : ''} />
              <span className="hidden lg:block text-xs font-black tracking-widest leading-none">CÀI ĐẶT</span>
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col gap-5 overflow-hidden">
        <header className={`${styles.panel} rounded-[2rem] p-4 pr-10 shadow-xl shadow-black/5 flex items-center justify-between shrink-0 border border-white/50 dark:border-slate-800/50 z-40 transition-all`}>
          <div className="flex items-center gap-8 flex-1 ml-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-0.5">
                <span style={theme === 'spring' ? { color: springColor } : {}} className={`text-[8px] font-black tracking-[0.3em] uppercase opacity-70 ${theme !== 'spring' ? 'text-[#BC8F44]' : ''}`}>Hệ thống</span>
                <ChevronRight size={10} className="opacity-40" />
              </div>
              <h1 className={`text-xl font-black ${theme === 'spring' ? 'text-slate-800' : styles.textPrimary} tracking-tighter uppercase leading-none`}>
                {menuItems.find(i => i.id === currentTab)?.label || 'CÀI ĐẶT'}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <button onClick={toggleTheme} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-inner border border-black/5 ${
              theme === 'light' ? 'bg-amber-50 text-amber-500 hover:bg-amber-100' : 
              theme === 'dark' ? 'bg-indigo-950 text-indigo-400 hover:bg-indigo-900' : 
              'bg-red-50 text-red-600 hover:bg-red-100'
            }`}>
              {theme === 'light' && <Sun size={18} />}
              {theme === 'dark' && <Moon size={18} />}
              {theme === 'spring' && <Sparkles size={18} />}
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-[#BC8F44] relative border border-black/5 transition-colors">
              <Bell size={18} />
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
            </button>
            <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 mx-1 hidden sm:block"></div>
            <div className="flex items-center gap-4">
               <div className="text-right hidden sm:block">
                  <p className={`text-[11px] font-black uppercase ${theme === 'spring' ? 'text-slate-800' : styles.textPrimary} leading-none mb-1`}>{user.fullName}</p>
                  <p style={theme === 'spring' ? { color: springColor } : {}} className={`text-[8px] font-bold uppercase tracking-widest ${theme !== 'spring' ? 'text-[#BC8F44]' : ''}`}>{user.role}</p>
               </div>
               <div style={theme === 'spring' ? { backgroundColor: springColor } : {}} className={`w-10 h-10 rounded-xl ${theme !== 'spring' ? 'bg-[#BC8F44]' : ''} text-white flex items-center justify-center font-black text-[10px] shadow-lg shadow-black/10`}>
                  {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
               </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pr-1 no-scrollbar scroll-smooth">
           {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
