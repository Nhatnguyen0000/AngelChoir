
import React from 'react';
import { 
  Users, Calendar, Music, TrendingUp, BellRing, 
  ChevronRight, Info
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

  const stats = [
    { label: 'CA VIÊN', value: members.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'LỊCH PHỤNG VỤ', value: schedules.length, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'THƯ VIỆN NHẠC', value: songs.length, icon: Music, color: 'text-[#BC8F44]', bg: 'bg-[#BC8F44]/10' },
    { label: 'CÔNG VỤ', value: schedules.filter(s => s.thanhVienThamGia.length > 0).length, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-700 pb-10 px-2">
      {/* Refined Notice Banner - Compact Version */}
      {notice.isVisible && (
        <div 
          style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }}
          className="mx-2 px-6 py-4 text-white rounded-[1.5rem] flex items-center justify-between shadow-2xl border border-white/10 transition-all hover:scale-[1.005]"
        >
            <div className="flex items-center gap-5 flex-1">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 shadow-inner">
                  <BellRing size={20} className="animate-pulse text-amber-300" /> 
                </div>
                <div className="flex flex-col">
                    <h3 className="text-[13px] font-black uppercase tracking-tight leading-none mb-1">{notice.title}</h3>
                    <p className="text-white/60 text-[11px] font-bold line-clamp-1 italic tracking-tight">{notice.content}</p>
                </div>
            </div>
            <button className="px-6 py-2.5 bg-white text-slate-900 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-2 shadow-xl hover:bg-slate-100">
              {notice.buttonText} <ChevronRight size={14} />
            </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-2">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] shadow-lg border border-white/50 dark:border-slate-800/50 group hover:-translate-y-1 transition-all">
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 ${stat.bg} dark:bg-slate-800 rounded-2xl flex items-center justify-center ${stat.color} shadow-sm group-hover:scale-110 transition-transform`}>
                 <stat.icon size={22} />
              </div>
              <div>
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</h4>
                <p className={`text-2xl font-black tracking-tighter leading-none ${isSpring ? 'text-slate-800' : 'text-slate-900 dark:text-white'}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="px-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/50 dark:border-slate-800/50 min-h-[300px] flex flex-col items-center justify-center text-center opacity-40">
             <Info size={40} className="text-slate-300 mb-4" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Biểu đồ phụng vụ đang đồng bộ...</p>
          </div>
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/50 dark:border-slate-800/50 min-h-[300px] flex flex-col items-center justify-center text-center opacity-40">
             <Users size={40} className="text-slate-300 mb-4" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Danh sách vinh danh đang cập nhật...</p>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
