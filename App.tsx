
import React, { useState, useEffect, useMemo } from 'react';
import { getCurrentUser, getSpringColor } from './store';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Schedules from './pages/Schedules';
import Songs from './pages/Songs';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AIAssistant from './pages/AIAssistant';
import Finance from './pages/Finance';
import Header from './components/Header';
import { Theme } from './types';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Music, 
  BarChart2, 
  Settings as SettingsIcon,
  Music2,
  Cpu,
  Wallet
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

  const translatedMenuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Bảng Điều Khiển' },
    { id: 'members', icon: Users, label: 'Quản Lý Ca Viên' },
    { id: 'schedules', icon: Calendar, label: 'Lịch Phụng Vụ' },
    { id: 'songs', icon: Music, label: 'Thư Viện Nhạc' },
    { id: 'finance', icon: Wallet, label: 'Quản Lý Quỹ' },
    { id: 'ai', icon: Cpu, label: 'Trợ Lý AI' },
    { id: 'reports', icon: BarChart2, label: 'Báo Cáo Thống Kê' },
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
        textPrimary: 'text-[#0F172A]',
      },
      dark: {
        bg: 'bg-[#020617]',
        sidebar: 'bg-[#0F172A]',
        textPrimary: 'text-white',
      },
      spring: {
        bg: 'bg-[#FFFBEB]',
        sidebar: springColor,
        textPrimary: `text-[${springColor}]`,
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
      case 'finance': return <Finance />;
      case 'ai': return <AIAssistant />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  const currentTitle = translatedMenuItems.find(i => i.id === currentTab)?.label || 'Cài đặt';

  return (
    <div className={`flex h-screen ${styles.bg} p-4 md:p-5 gap-5 font-sans overflow-hidden transition-all duration-500`}>
      {/* Sidebar: Group and Hover Expansion with perfect icon centering */}
      <aside 
        style={theme === 'spring' ? { backgroundColor: springColor } : {}}
        className={`group w-20 hover:w-72 ${theme !== 'spring' ? styles.sidebar : ''} rounded-[2.5rem] flex flex-col py-10 shadow-2xl shrink-0 transition-all duration-500 ease-in-out z-50 overflow-hidden items-center group-hover:items-stretch`}
      >
        <div className="flex items-center justify-center group-hover:justify-start group-hover:px-7 mb-14 transition-all duration-500 w-full overflow-hidden">
          <div className="w-11 h-11 bg-white/15 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/10 shrink-0">
            <Music2 size={22} />
          </div>
          <div className="hidden group-hover:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150 whitespace-nowrap overflow-hidden ml-4">
            <h2 className="font-black text-xl tracking-tighter uppercase leading-none text-white">AngelChoir</h2>
            <p className="text-[7px] font-black opacity-40 uppercase tracking-[0.3em] mt-1.5 text-white">Cổng Thông Tin Cao Cấp</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-3 px-3 overflow-y-auto no-scrollbar overflow-x-hidden w-full">
          {translatedMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center justify-center group-hover:justify-start px-0 group-hover:px-5 py-4 rounded-[1.5rem] transition-all duration-300 relative w-full overflow-hidden ${
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
                <span className={`hidden group-hover:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 text-[10px] font-black tracking-widest leading-none whitespace-nowrap uppercase ml-4 ${isActive ? 'opacity-100' : ''}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute left-0 w-1 h-6 bg-current opacity-20 rounded-r-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto px-3 pt-6 border-t border-white/10 w-full">
           <button 
             onClick={() => setCurrentTab('settings')}
             className={`w-full flex items-center justify-center group-hover:justify-start px-0 group-hover:px-5 py-4 rounded-[1.5rem] transition-all duration-300 overflow-hidden ${
               currentTab === 'settings' 
               ? 'bg-white text-slate-900 shadow-xl shadow-black/10' 
               : 'text-white/40 hover:text-white hover:bg-white/5'
             }`}
           >
              <SettingsIcon size={20} className={`shrink-0 ${currentTab === 'settings' ? 'animate-spin-slow' : ''}`} />
              <span className="hidden group-hover:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 text-[10px] font-black tracking-widest leading-none uppercase whitespace-nowrap ml-4">
                CÀI ĐẶT
              </span>
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col gap-5 overflow-hidden">
        <Header 
          user={user} 
          theme={theme} 
          title={currentTitle} 
          springColor={springColor}
          onToggleTheme={toggleTheme} 
        />

        <div className="flex-1 overflow-y-auto pr-1 no-scrollbar scroll-smooth">
           {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
