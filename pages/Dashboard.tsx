
import React from 'react';
import { Users, Calendar, Music, TrendingUp, BellRing } from 'lucide-react';
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
    { label: 'THÀNH VIÊN', value: members.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'LỊCH PHỤNG VỤ', value: schedules.length, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'THƯ VIỆN NHẠC', value: songs.length, icon: Music, color: 'text-[#BC8F44]', bg: 'bg-[#BC8F44]/10' },
    { label: 'ĐIỂM CỐNG HIẾN', value: members.reduce((acc, m) => acc + m.points, 0), icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1 ml-4">
         <h2 className={`text-3xl font-black uppercase tracking-tighter ${isSpring ? 'text-slate-800' : 'text-[#0F172A] dark:text-white'}`}>Bảng điều khiển</h2>
         <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.4em]">Tổng quan dữ liệu thời gian thực</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="p-5 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-lg border border-white/50 dark:border-slate-800 group hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center ${stat.color} shadow-inner group-hover:scale-105 transition-transform`}>
                 <stat.icon size={20} />
              </div>
              <div>
                <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-0.5">{stat.label}</h4>
                <p className={`text-2xl font-black tracking-tighter leading-none ${isSpring ? 'text-slate-800' : 'text-[#0F172A] dark:text-white'}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
         {notice.isVisible && (
           <div 
             style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#1E293B' }}
             className="lg:col-span-7 p-8 text-white rounded-[2rem] flex flex-col justify-between min-h-[220px] relative overflow-hidden shadow-xl"
           >
              <div className="relative z-10">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[8px] font-black tracking-widest uppercase mb-4 border border-white/10">
                   <BellRing size={10} /> THÔNG BÁO
                 </div>
                 <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 leading-tight">{notice.title}</h3>
                 <p className="text-white/70 text-xs font-medium leading-relaxed mb-6 max-w-sm">{notice.content}</p>
                 <button className="px-7 py-3 bg-white text-slate-900 rounded-full text-[9px] font-black tracking-[0.2em] uppercase hover:scale-105 transition-all">
                   {notice.buttonText}
                 </button>
              </div>
              <Music size={160} className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none rotate-12" />
           </div>
         )}

         <div className={`${notice.isVisible ? 'lg:col-span-5' : 'lg:col-span-12'} p-8 bg-white dark:bg-slate-900 rounded-[2rem] shadow-lg border border-white dark:border-slate-800`}>
            <div className="flex items-center justify-between mb-6 border-b border-slate-50 dark:border-slate-800 pb-4">
               <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">CA VIÊN GƯƠNG MẪU</h3>
               <TrendingUp size={14} className="text-[#BC8F44] opacity-50" />
            </div>
            <div className="space-y-2">
               {members.length > 0 ? (
                 members.sort((a,b) => b.points - a.points).slice(0, 4).map((m, idx) => (
                   <div key={m.id} className="flex items-center justify-between py-3 group cursor-pointer border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-3 rounded-xl transition-all">
                      <div className="flex items-center gap-4">
                         <span className={`text-xs font-black ${idx < 3 ? 'text-[#BC8F44]' : 'text-slate-300'}`}>{(idx + 1).toString().padStart(2, '0')}</span>
                         <div style={isSpring ? { backgroundColor: springColor + '10', color: springColor } : { backgroundColor: '#BC8F4410', color: '#BC8F44' }} className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] uppercase shadow-inner">
                            {m.hoTen[0]}
                         </div>
                         <div>
                            <span className={`text-xs font-black uppercase tracking-tight ${isSpring ? 'text-slate-800' : 'text-[#0F172A] dark:text-white'}`}>{m.tenThanh} {m.hoTen}</span>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">{m.vaiTro}</p>
                         </div>
                      </div>
                      <p className="text-[10px] font-black text-[#BC8F44] tracking-widest">{m.points} PTS</p>
                   </div>
                 ))
               ) : (
                 <div className="text-center py-12 opacity-30">
                   <p className="text-[9px] font-black uppercase tracking-widest">Chưa có dữ liệu</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
