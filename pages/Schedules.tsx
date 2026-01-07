
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
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
  Fingerprint
} from 'lucide-react';
import { getSchedules, saveSchedules, getMembers, getSpringColor } from '../store';
import { LichTap, ThanhVien } from '../types';

const Schedules: React.FC = () => {
  const [schedules, setSchedules] = useState<LichTap[]>([]);
  const [members, setMembers] = useState<ThanhVien[]>([]);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<LichTap | null>(null);
  
  const currentTheme = localStorage.getItem('theme') || 'light';
  const isSpring = currentTheme === 'spring';
  const springColor = getSpringColor();

  const [newSchedule, setNewSchedule] = useState({
    ngayTap: new Date().toISOString().split('T')[0],
    gio: '19:30',
    noiDung: ''
  });

  const [attendanceSearch, setAttendanceSearch] = useState('');

  useEffect(() => {
    setSchedules(getSchedules());
    setMembers(getMembers().filter(m => m.trangThai === 'Hoạt động'));
  }, []);

  const handleOpenAttendance = (schedule: LichTap) => {
    setSelectedSchedule(schedule);
    setIsAttendanceModalOpen(true);
  };

  const toggleAttendance = (memberId: number) => {
    if (!selectedSchedule) return;

    const isPresent = selectedSchedule.thanhVienThamGia.includes(memberId);
    let newAttendance: number[];

    if (isPresent) {
      newAttendance = selectedSchedule.thanhVienThamGia.filter(id => id !== memberId);
    } else {
      newAttendance = [...selectedSchedule.thanhVienThamGia, memberId];
    }

    const updatedSchedule = { ...selectedSchedule, thanhVienThamGia: newAttendance };
    const updatedSchedules = schedules.map(s => s.id === selectedSchedule.id ? updatedSchedule : s);
    
    setSchedules(updatedSchedules);
    setSelectedSchedule(updatedSchedule);
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

  const filteredMembersForAttendance = useMemo(() => {
    return members.filter(m => (m.tenThanh + ' ' + m.hoTen).toLowerCase().includes(attendanceSearch.toLowerCase()));
  }, [members, attendanceSearch]);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-10 pb-20 max-w-[1500px] mx-auto animate-in fade-in duration-700 px-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1 ml-4">
           <h2 className={`text-4xl font-black uppercase tracking-tighter ${isSpring ? 'text-slate-800' : 'text-[#354E4D] dark:text-white'}`}>Lịch Phụng Vụ</h2>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Điều hành kế hoạch ca đoàn</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }}
          className="w-16 h-16 text-white rounded-[1.8rem] shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center border border-white/20"
        >
          <Plus size={32} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.map(s => (
          <div key={s.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl border border-white dark:border-slate-800 group relative hover:-translate-y-2 transition-all duration-500">
            <button 
              onClick={() => { if(window.confirm('Xóa lịch?')) { const u = schedules.filter(x => x.id !== s.id); setSchedules(u); saveSchedules(u); } }}
              className="absolute top-6 right-6 p-2 text-slate-200 hover:text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={16} />
            </button>

            <div className="flex items-center gap-5 mb-8">
              <div style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#1E293B' }} className="w-16 h-16 rounded-[1.5rem] flex flex-col items-center justify-center text-white border-2 border-white/50 shadow-lg shrink-0">
                <span className="text-[9px] font-black uppercase tracking-tighter opacity-50 mb-0.5">T.{new Date(s.ngayTap).getMonth() + 1}</span>
                <span className="text-2xl font-black tracking-tighter leading-none">{new Date(s.ngayTap).getDate()}</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1.5">
                  <Clock size={12} style={{ color: springColor }} /> {s.gio}
                </div>
                <h3 className="text-base font-black text-slate-800 dark:text-white leading-tight uppercase tracking-tight line-clamp-2">{s.noiDung}</h3>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="flex -space-x-2.5">
                    {s.thanhVienThamGia.slice(0, 3).map(id => {
                      const m = members.find(x => x.id === id);
                      return m ? (
                        <div key={id} className="w-9 h-9 rounded-xl border-2 border-white dark:border-slate-900 bg-[#BC8F44]/10 flex items-center justify-center text-[10px] font-black text-[#BC8F44] shadow-sm">{getInitials(m.hoTen)}</div>
                      ) : null;
                    })}
                 </div>
                 <span className="text-[11px] font-black text-slate-400 ml-2">
                    {s.thanhVienThamGia.length > 0 ? `+${s.thanhVienThamGia.length} CÓ MẶT` : 'CHƯA ĐIỂM DANH'}
                 </span>
              </div>
              <button 
                onClick={() => handleOpenAttendance(s)}
                className={`w-12 h-12 rounded-[1rem] flex items-center justify-center transition-all shadow-inner border border-black/5 ${
                  s.thanhVienThamGia.length > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
                }`}
              >
                <CheckCircle2 size={22} />
              </button>
            </div>
          </div>
        ))}
        {schedules.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-20 grayscale">
            <CalendarDays size={80} />
            <p className="text-sm font-black uppercase tracking-[0.5em] mt-4">Chưa có kế hoạch phụng vụ</p>
          </div>
        )}
      </div>

      {/* Attendance Modal */}
      {isAttendanceModalOpen && selectedSchedule && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-3xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-500">
           <div className="bg-white dark:bg-slate-950 w-full max-w-4xl rounded-[4rem] shadow-2xl relative border border-white/20 p-10 lg:p-14 animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col max-h-[90vh]">
              <button onClick={() => setIsAttendanceModalOpen(false)} className="absolute top-10 right-10 p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-3xl hover:bg-red-500 hover:text-white transition-all shadow-lg z-10"><X size={24} /></button>
              
              <div className="flex items-center gap-6 mb-10">
                 <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                    <Fingerprint size={32} />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter dark:text-white leading-none">Điểm danh hiện diện</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{selectedSchedule.noiDung} - {selectedSchedule.ngayTap}</p>
                 </div>
              </div>

              <div className="mb-6 relative">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                 <input 
                    type="text" 
                    placeholder="Tìm nhanh ca viên..." 
                    className="w-full pl-14 pr-8 py-5 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-none outline-none font-bold dark:text-white shadow-inner"
                    value={attendanceSearch}
                    onChange={(e) => setAttendanceSearch(e.target.value)}
                 />
              </div>

              <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMembersForAttendance.map(m => {
                      const isPresent = selectedSchedule.thanhVienThamGia.includes(m.id);
                      return (
                        <button 
                          key={m.id}
                          onClick={() => toggleAttendance(m.id)}
                          className={`p-6 rounded-[2rem] border-2 transition-all flex items-center gap-4 text-left group ${
                            isPresent 
                            ? 'bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-500/10' 
                            : 'bg-white dark:bg-slate-900 border-transparent hover:border-slate-100 dark:hover:border-slate-800'
                          }`}
                        >
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 transition-all ${
                             isPresent ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                           }`}>
                              {isPresent ? <Check size={20} strokeWidth={4} /> : getInitials(m.hoTen)}
                           </div>
                           <div className="flex flex-col overflow-hidden">
                              <span className={`text-[9px] font-black uppercase tracking-tighter mb-0.5 ${isPresent ? 'text-emerald-600' : 'text-slate-400'}`}>{m.tenThanh}</span>
                              <span className={`text-sm font-bold truncate leading-none ${isPresent ? 'text-emerald-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>{m.hoTen}</span>
                           </div>
                        </button>
                      );
                    })}
                 </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hiện diện:</span>
                    <span className="px-4 py-1.5 bg-emerald-500 text-white text-[12px] font-black rounded-full shadow-lg shadow-emerald-500/20">{selectedSchedule.thanhVienThamGia.length}</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-[12px] font-black text-slate-400">{members.length}</span>
                 </div>
                 <button 
                    onClick={() => setIsAttendanceModalOpen(false)}
                    style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }}
                    className="px-10 py-5 text-white rounded-full text-[12px] font-black tracking-[0.3em] uppercase shadow-xl hover:scale-105 transition-all"
                 >
                    HOÀN TẤT
                 </button>
              </div>
           </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4 animate-in zoom-in-95 duration-300">
           <div className="bg-white dark:bg-slate-950 w-full max-w-xl rounded-[4rem] p-16 shadow-2xl relative border border-white/20">
              <button onClick={() => setIsAddModalOpen(false)} className="absolute top-10 right-10 p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-3xl hover:bg-red-500 hover:text-white transition-all"><X size={24} /></button>
              <h3 className="text-4xl font-black uppercase tracking-tighter mb-12 dark:text-white">Thêm lịch mới</h3>
              <form onSubmit={handleAddSchedule} className="space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Ngày thực hiện</label>
                       <input type="date" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-none outline-none font-bold shadow-inner dark:text-white" value={newSchedule.ngayTap} onChange={e => setNewSchedule({...newSchedule, ngayTap: e.target.value})}/>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Giờ bắt đầu</label>
                       <input type="time" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-none outline-none font-bold shadow-inner dark:text-white" value={newSchedule.gio} onChange={e => setNewSchedule({...newSchedule, gio: e.target.value})}/>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Nội dung phụng vụ</label>
                    <textarea rows={4} className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-none outline-none font-bold shadow-inner resize-none dark:text-white" placeholder="Ví dụ: Tập hát Lễ Phục Sinh..." value={newSchedule.noiDung} onChange={e => setNewSchedule({...newSchedule, noiDung: e.target.value})}></textarea>
                 </div>
                 <button type="submit" style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }} className="w-full py-6 text-white rounded-full text-[12px] font-black tracking-widest uppercase shadow-xl hover:scale-105 transition-all">LƯU KẾ HOẠCH</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Schedules;
