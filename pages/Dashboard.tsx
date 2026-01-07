
import React from 'react';
import { Users, Calendar, Music, TrendingUp, BellRing } from 'lucide-react';
import { getMembers, getSchedules, getSongs } from '../store';

const Dashboard: React.FC = () => {
  const members = getMembers();
  const schedules = getSchedules();
  const songs = getSongs();

  const stats = [
    { label: 'THÀNH VIÊN', value: members.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'LỊCH PHỤNG VỤ', value: schedules.length, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'THƯ VIỆN NHẠC', value: songs.length, icon: Music, color: 'text-[#BC8F44]', bg: 'bg-[#BC8F44]/10' },
    { label: 'ĐIỂM CỐNG HIẾN', value: members.reduce((acc, m) => acc + m.points, 0), icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1 ml-4">
         <h2 className="text-4xl font-black uppercase tracking-tighter text-[#0F172A] dark:text-white">Bảng điều khiển</h2>
         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">Tổng quan dữ liệu thời gian thực</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-white/50 dark:border-slate-800 group hover:-translate-y-1 transition-all duration-300">
            <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center ${stat.color} mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
               <stat.icon size={24} />
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{stat.label}</h4>
            <div className="flex items-end gap-2">
               <p className="text-4xl font-black text-[#0F172A] dark:text-white tracking-tighter leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Card thông báo đã được thu nhỏ */}
         <div className="lg:col-span-6 p-10 bg-[#1E293B] text-white rounded-[3rem] flex flex-col justify-between min-h-[260px] relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#BC8F44] rounded-full text-[9px] font-black tracking-widest uppercase mb-6">
                 <BellRing size={12} /> THÔNG BÁO MỚI
               </div>
               <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 leading-tight">Mừng Lễ Phục Sinh 2024</h3>
               <p className="text-slate-400 text-xs font-medium leading-relaxed mb-8 max-w-xs">Lịch tập hát bổ sung đã sẵn sàng. Ca viên vui lòng xem tại thư viện để tải bản nhạc mới.</p>
               <button className="px-8 py-3 bg-white text-[#1E293B] rounded-full text-[9px] font-black tracking-[0.2em] uppercase hover:bg-[#BC8F44] hover:text-white transition-all">XEM LỊCH</button>
            </div>
            <Music size={180} className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none" />
         </div>

         {/* Ranking Card */}
         <div className="lg:col-span-6 p-10 bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl border border-white dark:border-slate-800">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8 border-b border-slate-50 dark:border-slate-800 pb-4">CA VIÊN GƯƠNG MẪU</h3>
            <div className="space-y-4">
               {members.length > 0 ? (
                 members.sort((a,b) => b.points - a.points).slice(0, 4).map((m, idx) => (
                   <div key={m.id} className="flex items-center justify-between py-3 group cursor-pointer border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                      <div className="flex items-center gap-4">
                         <span className={`text-xs font-black ${idx < 3 ? 'text-[#BC8F44]' : 'text-slate-300'}`}>0{idx + 1}</span>
                         <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-[#BC8F44] font-black text-[10px] uppercase shadow-inner group-hover:bg-[#BC8F44] group-hover:text-white transition-all">
                            {m.hoTen[0]}
                         </div>
                         <span className="text-xs font-black text-[#0F172A] dark:text-white uppercase tracking-tight group-hover:translate-x-1 transition-transform">{m.tenThanh} {m.hoTen}</span>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-[#BC8F44] tracking-widest">{m.points} PTS</p>
                      </div>
                   </div>
                 ))
               ) : (
                 <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest text-center py-10">Chưa có dữ liệu xếp hạng</p>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
