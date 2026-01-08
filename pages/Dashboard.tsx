
import React, { useMemo } from 'react';
import { 
  Users, Calendar, Music, TrendingUp, BellRing, 
  ArrowRight, Cake, Clock, MapPin, Sparkles,
  ChevronRight, Award, Zap
} from 'lucide-react';
import { getMembers, getSchedules, getSongs, getNotice, getSpringColor } from '../store';

const Dashboard: React.FC = () => {
  const members = getMembers();
  const schedules = getSchedules();
  const songs = getSongs();
  const notice = getNotice();
  
  const currentTheme = localStorage.getItem('theme') || 'light';
  const isSpring = currentTheme === 'spring';
  const springColor = getSpringColor();

  const todaysBirthdays = useMemo(() => {
    const today = new Date();
    const mmdd = `${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    return members.filter(m => m.ngaySinh && m.ngaySinh.endsWith(mmdd));
  }, [members]);

  const stats = [
    { label: 'CA VIÊN', value: members.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'LỊCH PHỤNG VỤ', value: schedules.length, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'THƯ VIỆN NHẠC', value: songs.length, icon: Music, color: 'text-[#BC8F44]', bg: 'bg-[#BC8F44]/10' },
    { label: 'CỐNG HIẾN', value: members.reduce((acc, m) => acc + (m.points || 0), 0), icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-700 pb-10 px-2">
      {/* Slim Notice Banner */}
      {notice.isVisible && (
        <div 
          style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }}
          className="mx-2 px-6 py-4 text-white rounded-[1.5rem] flex items-center justify-between shadow-lg border border-white/10 group transition-all"
        >
            <div className="flex items-center gap-4 flex-1">
                <BellRing size={18} className="animate-pulse text-amber-300 shrink-0" /> 
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                    <h3 className="text-sm font-black uppercase tracking-tight line-clamp-1">{notice.title}</h3>
                    <p className="text-white/60 text-[11px] font-medium line-clamp-1 italic">{notice.content}</p>
                </div>
            </div>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[9px] font-black tracking-widest uppercase transition-all flex items-center gap-2 border border-white/10">
              {notice.buttonText} <ChevronRight size={12} />
            </button>
        </div>
      )}

      {/* Compact Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-2">
        {stats.map((stat, i) => (
          <div key={i} className="p-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[2rem] shadow-md border border-white dark:border-slate-800/50 group hover:-translate-y-1 transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 ${stat.bg} dark:bg-slate-800 rounded-xl flex items-center justify-center ${stat.color}`}>
                 <stat.icon size={18} />
              </div>
              <div>
                <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">{stat.label}</h4>
                <p className={`text-xl font-black tracking-tighter leading-none ${isSpring ? 'text-slate-800' : 'text-slate-900 dark:text-white'}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start px-2">
         {/* Main content can go here (Upcoming events, etc) */}
      </div>
    </div>
  );
};

export default Dashboard;
