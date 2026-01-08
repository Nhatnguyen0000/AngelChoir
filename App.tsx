
import React, { useState, useEffect, useMemo } from 'react';
import { getCurrentUser, getSpringColor } from './store';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Schedules from './pages/Schedules';
import Songs from './pages/Songs';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Finance from './pages/Finance';
import Header from './components/Header';
import { Theme } from './types';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Music, 
  BarChart2, 
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

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Bảng Điều Khiển' },
    { id: 'members', icon: Users, label: 'Ca Viên' },
    { id: 'schedules', icon: Calendar, label: 'Phụng Vụ' },
    { id: 'songs', icon: Music, label: 'Thư Viện' },
    { id: 'finance', icon: Wallet, label: 'Tài Chính' },
    { id: 'reports', icon: BarChart2, label: 'Thống Kê' },
  ];

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('spring');
    else setTheme('light');
  };

  const styles = useMemo(() => {
    const base = {
      light: { bg: 'bg-[#F8FAFC]' },
      dark: { bg: 'bg-[#020617]' },
      spring: { bg: 'bg-[#FFFBEB]' }
    }[theme];
    return base;
  }, [theme]);

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard': return <Dashboard />;
      case 'members': return <Members />;
      case 'schedules': return <Schedules />;
      case 'songs': return <Songs />;
      case 'finance': return <Finance />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className={`flex flex-col h-screen ${styles.bg} transition-all duration-500 overflow-hidden`}>
      <Header 
        user={user} 
        theme={theme} 
        currentTab={currentTab}
        menuItems={menuItems}
        springColor={springColor} 
        onTabChange={setCurrentTab}
        onToggleTheme={toggleTheme} 
      />
      
      <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth p-6 pt-2">
         <div className="max-w-[1600px] mx-auto">
            {renderContent()}
         </div>
      </main>
    </div>
  );
};

export default App;
