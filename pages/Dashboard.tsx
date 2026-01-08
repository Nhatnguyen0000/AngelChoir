
import React from 'react';
import { 
  Users, Calendar, Music, TrendingUp, BellRing, 
  ChevronRight, Info, Shield, Target, Activity
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
    { label: 'TỔNG CA VIÊN', value: members.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50/80' },
    { label: 'PHỤNG VỤ THÁNG', value: schedules.length, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50/80' },
    { label: 'THƯ VIỆN NHẠC', value: songs.length, icon: Music, color: 'text-amber-600', bg: 'bg-amber-50/80' },
    { label: 'HIỆN DIỆN TB', value: '92%', icon: Target, color: 'text-purple-600', bg: 'bg-purple-50/80' },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-700 pb-16 px-2">
      {/* Banner Thông Báo */}
      {notice.isVisible && (
        <div 
          style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0f172a' }}
          className="mx-2 px-6 py-4 text-white rounded-[1.8rem] flex items-center justify-between shadow-xl border border-white/10 transition-all hover:scale-[1.002]"
        >
            <div className="flex items-center gap-5 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10">
                  <BellRing size={22} className="text-amber-300 animate-pulse" /> 
                </div>
                <div className="flex flex-col">
                    <h3 className="text-sm font-black uppercase tracking-tight leading-none mb-1">{notice.title}</h3>
                    <p className="text-white/60 text-xs font-medium line-clamp-1 italic tracking-tight">{notice.content}</p>
                </div>
            </div>
            <button className="px-6 py-2.5 bg-white text-slate-900 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-lg hover:bg-slate-100 flex items-center gap-2 transition-transform active:scale-95">
              XEM CHI TIẾT <ChevronRight size={14} />
            </button>
        </div>
      )}

      {/* Grid Thống Kê */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 px-2">
        {stats.map((stat, i) => (
          <div key={i} className="p-7 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-black/5 group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="flex items-center gap-6 relative z-10">
              <div className={`w-14 h-14 ${stat.bg} dark:bg-slate-800 rounded-2xl flex items-center justify-center ${stat.color} shadow-sm group-hover:scale-110 transition-transform`}>
                 <stat.icon size={26} />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">{stat.label}</h4>
                <p className={`text-3xl font-black tracking-tighter leading-none ${isSpring ? 'text-slate-800' : 'text-slate-900 dark:text-white'}`}>{stat.value}</p>
              </div>
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <stat.icon size={120} />
            </div>
          </div>
        ))}
      </div>
      
      {/* Content Sections */}
      <div className="px-2 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[3rem] p-10 border border-black/5 min-h-[400px] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center">
             <div className="opacity-20 flex flex-col items-center gap-6">
               <Activity size={100} className="text-slate-300" strokeWidth={1} />
               <p className="text-xl font-black uppercase tracking-[0.5em] text-slate-400">Dữ liệu hoạt động hệ thống</p>
               <p className="text-xs font-bold text-slate-300 max-w-xs uppercase">Đang tiến hành đồng bộ hóa từ máy chủ AngelCore v5.8</p>
             </div>
          </div>
          
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white/90 dark:bg-slate-900/90 rounded-[3rem] p-10 border border-black/5 shadow-xl">
                <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-3 text-slate-400">
                  <Shield size={18} className="text-emerald-500" /> Hệ thống bảo mật
                </h3>
                <div className="space-y-6">
                   <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-400">Sao lưu tự động</span>
                      <span className="text-emerald-600 uppercase">Hoàn tất</span>
                   </div>
                   <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-400">Mã hóa dữ liệu</span>
                      <span className="text-emerald-600 uppercase">AES-256</span>
                   </div>
                </div>
             </div>
             
             <div className="bg-[#0f172a] rounded-[3rem] p-10 shadow-2xl text-white relative overflow-hidden group">
                <Music size={120} className="absolute -right-10 -bottom-10 opacity-5 rotate-12 transition-transform group-hover:scale-110" />
                <div className="relative z-10">
                   <h3 className="text-lg font-black uppercase tracking-tighter mb-4">AngelChoir Cloud</h3>
                   <p className="text-[11px] font-bold text-white/50 leading-relaxed italic uppercase tracking-wider">Phiên bản quản trị phụng vụ chuyên sâu dành riêng cho ca đoàn.</p>
                </div>
             </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;