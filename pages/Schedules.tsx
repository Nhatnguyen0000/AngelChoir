
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  CheckCircle2, 
  X, 
  Search, 
  User as UserIcon, 
  Trash2,
  Check,
  PlusCircle,
  CalendarDays,
  Users,
  AlertCircle
} from 'lucide-react';
import { getSchedules, saveSchedules, getMembers } from '../store';
import { LichTap, ThanhVien } from '../types';

const Schedules: React.FC = () => {
  const [schedules, setSchedules] = useState<LichTap[]>([]);
  const [members, setMembers] = useState<ThanhVien[]>([]);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<LichTap | null>(null);
  const [attendanceSearch, setAttendanceSearch] = useState('');
  
  const [newSchedule, setNewSchedule] = useState({
    ngayTap: new Date().toISOString().split('T')[0],
    gio: '19:30',
    noiDung: ''
  });

  useEffect(() => {
    setSchedules(getSchedules());
    setMembers(getMembers());
  }, []);

  const handleOpenAttendance = (schedule: LichTap) => {
    setSelectedSchedule(schedule);
    setIsAttendanceModalOpen(true);
  };

  const toggleMemberAttendance = (memberId: number) => {
    if (!selectedSchedule) return;
    const isAttending = selectedSchedule.thanhVienThamGia.includes(memberId);
    let updatedIds = isAttending 
      ? selectedSchedule.thanhVienThamGia.filter(id => id !== memberId)
      : [...selectedSchedule.thanhVienThamGia, memberId];

    const updatedSchedule = { ...selectedSchedule, thanhVienThamGia: updatedIds };
    setSelectedSchedule(updatedSchedule);
    const updatedSchedules = schedules.map(s => s.id === updatedSchedule.id ? updatedSchedule : s);
    setSchedules(updatedSchedules);
    saveSchedules(updatedSchedules);
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const schedule: LichTap = { id: Date.now(), ...newSchedule, thanhVienThamGia: [] };
    const updated = [schedule, ...schedules];
    setSchedules(updated);
    saveSchedules(updated);
    setIsAddModalOpen(false);
    setNewSchedule({ ngayTap: new Date().toISOString().split('T')[0], gio: '19:30', noiDung: '' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredMembers = members.filter(m => 
    m.hoTen.toLowerCase().includes(attendanceSearch.toLowerCase()) || 
    m.tenThanh.toLowerCase().includes(attendanceSearch.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 ml-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#BC8F44] shadow-lg shadow-[#BC8F44]/50"></div>
              <p className="text-[10px] font-black text-[#BC8F44] uppercase tracking-[0.4em]">Kế hoạch phụng vụ</p>
           </div>
           <h2 className="text-5xl font-black text-[#354E4D] dark:text-white uppercase tracking-tighter">Lịch Hoạt Động</h2>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-10 py-5 bg-[#354E4D] text-white rounded-full text-[10px] font-black tracking-[0.2em] uppercase shadow-2xl shadow-[#354E4D]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          TẠO LỊCH PHỤNG VỤ <PlusCircle size={18} />
        </button>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {schedules.map(s => (
          <div key={s.id} className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 shadow-2xl shadow-black/5 border border-white dark:border-slate-800/50 group relative hover:-translate-y-2 transition-all duration-500">
            {/* Delete button (hover only) */}
            <button 
              onClick={() => { if(window.confirm('Xóa lịch?')) { const u = schedules.filter(x => x.id !== s.id); setSchedules(u); saveSchedules(u); } }}
              className="absolute top-8 right-8 p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={18} />
            </button>

            {/* Date Badge */}
            <div className="flex items-center gap-6 mb-10">
              <div className="w-20 h-20 bg-[#1E293B] dark:bg-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-white border-4 border-white dark:border-slate-700 shadow-xl group-hover:bg-[#BC8F44] transition-all duration-500 shrink-0">
                <span className="text-[10px] font-black uppercase tracking-tighter opacity-40 mb-1">T.{new Date(s.ngayTap).getMonth() + 1}</span>
                <span className="text-3xl font-black tracking-tighter leading-none">{new Date(s.ngayTap).getDate()}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 text-slate-300 text-[10px] font-black uppercase tracking-widest mb-2">
                  <Clock size={12} className="text-[#BC8F44]" /> {s.gio} — Nhà Mục Vụ
                </div>
                <h3 className="text-xl font-black text-[#354E4D] dark:text-white leading-tight uppercase tracking-tight line-clamp-2">{s.noiDung}</h3>
              </div>
            </div>

            {/* Content Summary */}
            <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                   {members.slice(0, 3).map(m => (
                     <div key={m.id} className="w-10 h-10 rounded-2xl border-4 border-white dark:border-slate-900 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-[#BC8F44] shadow-sm">
                        {getInitials(m.hoTen)}
                     </div>
                   ))}
                   <div className="w-10 h-10 rounded-2xl border-4 border-white dark:border-slate-900 bg-[#354E4D] flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                      {s.thanhVienThamGia.length}
                   </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Hiện diện</span>
                  <span className="text-[11px] font-black text-[#BC8F44] leading-none">{Math.round((s.thanhVienThamGia.length / (members.length || 1)) * 100)}%</span>
                </div>
              </div>
              <button 
                onClick={() => handleOpenAttendance(s)}
                className="w-14 h-14 bg-slate-50 dark:bg-slate-800 text-[#BC8F44] rounded-[1.5rem] flex items-center justify-center hover:bg-[#BC8F44] hover:text-white transition-all shadow-inner border border-black/5"
              >
                <CheckCircle2 size={24} />
              </button>
            </div>
          </div>
        ))}

        {schedules.length === 0 && (
          <div className="col-span-full py-40 bg-white dark:bg-slate-900 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center opacity-50">
             <Calendar size={64} className="text-slate-200 mb-8" />
             <h3 className="text-3xl font-black text-[#354E4D] dark:text-white uppercase tracking-tighter">Trống kế hoạch</h3>
             <p className="text-xs text-slate-400 font-bold mt-4 uppercase tracking-[0.3em]">Nhấn "Tạo lịch" để bắt đầu công tác</p>
          </div>
        )}
      </div>

      {/* Attendance Modal */}
      {isAttendanceModalOpen && selectedSchedule && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-[#0F172A]/90 backdrop-blur-3xl" onClick={() => setIsAttendanceModalOpen(false)}></div>
          <div className="bg-white dark:bg-slate-950 w-full max-w-5xl rounded-[4rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh] border border-white/10 animate-in zoom-in-95 duration-500">
            
            <div className="p-12 border-b border-slate-50 dark:border-slate-800 flex justify-between items-start shrink-0">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-[#BC8F44]"></div>
                  <p className="text-[10px] font-black text-[#BC8F44] uppercase tracking-[0.5em]">Hệ thống kiểm diện</p>
                </div>
                <h3 className="text-4xl font-black text-[#354E4D] dark:text-white leading-none uppercase tracking-tighter mb-4">{selectedSchedule.noiDung}</h3>
                <div className="flex items-center gap-6">
                   <span className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest"><CalendarDays size={16} className="text-[#BC8F44]" /> {selectedSchedule.ngayTap}</span>
                   <span className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest"><Clock size={16} className="text-[#BC8F44]" /> {selectedSchedule.gio}</span>
                </div>
              </div>
              <button onClick={() => setIsAttendanceModalOpen(false)} className="p-5 text-slate-300 hover:text-red-500 rounded-3xl transition-all"><X size={36} /></button>
            </div>

            <div className="px-12 py-6 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 border-b border-slate-50 dark:border-slate-800">
               <div className="relative group max-w-2xl mx-auto">
                <Search size={20} className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#BC8F44] transition-all" />
                <input 
                  type="text" 
                  placeholder="Tìm theo tên thành viên..." 
                  className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-800 rounded-full border-none outline-none text-sm font-bold shadow-xl shadow-black/5 focus:ring-8 focus:ring-[#BC8F44]/5 transition-all"
                  value={attendanceSearch}
                  onChange={(e) => setAttendanceSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-4 no-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers.map(m => {
                  const isAttending = selectedSchedule.thanhVienThamGia.includes(m.id);
                  return (
                    <div 
                      key={m.id}
                      onClick={() => toggleMemberAttendance(m.id)}
                      className={`flex items-center justify-between p-6 rounded-[2.5rem] cursor-pointer transition-all border-2 group ${
                        isAttending 
                        ? 'bg-[#BC8F44]/5 border-[#BC8F44]/30 shadow-2xl shadow-[#BC8F44]/10 scale-[1.02]' 
                        : 'bg-white dark:bg-slate-900 border-transparent hover:border-slate-100 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                          isAttending ? 'bg-[#BC8F44] text-white rotate-6' : 'bg-slate-50 dark:bg-slate-800 text-slate-300'
                        }`}>
                          {isAttending ? <Check size={24} strokeWidth={3} /> : <UserIcon size={24} />}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-[13px] font-black uppercase tracking-tight truncate leading-none mb-1.5 ${isAttending ? 'text-[#BC8F44]' : 'text-[#354E4D] dark:text-white'}`}>
                            {m.tenThanh} {m.hoTen}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{m.vaiTro}</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 transition-all shrink-0 ${
                        isAttending ? 'border-[#BC8F44] bg-[#BC8F44]' : 'border-slate-100 dark:border-slate-800'
                      }`}>
                        {isAttending && <div className="w-full h-full flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-12 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-8">
                  <div className="flex flex-col">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ĐÃ ĐIỂM DANH</p>
                     <p className="text-3xl font-black text-[#BC8F44] leading-none">{selectedSchedule.thanhVienThamGia.length} / {members.length}</p>
                  </div>
                  <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
                  <div className="flex items-center gap-3">
                     <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                     <span className="text-[11px] font-black text-[#354E4D] dark:text-white uppercase tracking-widest">Đang cập nhật...</span>
                  </div>
               </div>
               <button 
                 onClick={() => setIsAttendanceModalOpen(false)}
                 className="px-16 py-7 bg-[#BC8F44] text-white rounded-full text-xs font-black tracking-[0.3em] uppercase shadow-2xl shadow-[#BC8F44]/30 hover:scale-105 active:scale-95 transition-all"
               >
                 XÁC NHẬN DỮ LIỆU
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#0F172A]/90 backdrop-blur-3xl" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-[4rem] shadow-2xl relative p-16 border border-white/10 animate-in zoom-in-95 duration-500">
            <div className="text-center mb-12">
               <div className="w-24 h-24 bg-[#BC8F44]/10 text-[#BC8F44] rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <CalendarDays size={48} />
               </div>
               <h3 className="text-4xl font-black text-[#354E4D] dark:text-white uppercase tracking-tighter mb-2">Lên Kế Hoạch</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">Phụng vụ hoặc luyện tập âm nhạc</p>
            </div>
            
            <form onSubmit={handleAddSchedule} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Tiêu đề sinh hoạt</label>
                <input 
                  type="text" 
                  placeholder="VD: Tập hát Đại lễ Phục Sinh" 
                  className="w-full px-10 py-6 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-none outline-none text-base font-bold dark:text-white shadow-inner focus:ring-4 focus:ring-[#BC8F44]/5 transition-all"
                  required
                  value={newSchedule.noiDung}
                  onChange={e => setNewSchedule({...newSchedule, noiDung: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Ngày</label>
                  <input type="date" required className="w-full px-10 py-6 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-none outline-none text-base font-bold dark:text-white shadow-inner" value={newSchedule.ngayTap} onChange={e => setNewSchedule({...newSchedule, ngayTap: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Giờ</label>
                  <input type="time" required className="w-full px-10 py-6 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-none outline-none text-base font-bold dark:text-white shadow-inner" value={newSchedule.gio} onChange={e => setNewSchedule({...newSchedule, gio: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-6 pt-10">
                <button type="submit" className="flex-1 py-7 bg-[#BC8F44] text-white rounded-full text-xs font-black tracking-[0.3em] uppercase shadow-2xl hover:scale-[1.02] transition-all">HOÀN TẤT LÊN LỊCH</button>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-12 py-7 bg-slate-100 text-slate-500 rounded-full text-xs font-black tracking-widest uppercase">HỦY</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedules;
