
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calendar, Plus, CheckCircle2, X, Search, 
  Trash2, Check, QrCode, ScanLine, List,
  Save, Users, Clock, AlertCircle, CalendarDays,
  ClipboardCheck
} from 'lucide-react';
import { getSchedules, saveSchedules, getMembers, getSpringColor } from '../store';
import { LichTap, ThanhVien } from '../types';

const Schedules: React.FC = () => {
  const [schedules, setSchedules] = useState<LichTap[]>([]);
  const [members, setMembers] = useState<ThanhVien[]>([]);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<LichTap | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [qrInput, setQrInput] = useState('');
  const [isQrMode, setIsQrMode] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [lastScanned, setLastScanned] = useState<string>('');
  
  const qrInputRef = useRef<HTMLInputElement>(null);
  const springColor = getSpringColor();
  const currentTheme = localStorage.getItem('theme') || 'light';
  const isSpring = currentTheme === 'spring';

  const [newSchedule, setNewSchedule] = useState({
    ngayTap: new Date().toISOString().split('T')[0],
    gio: '19:30',
    noiDung: ''
  });

  useEffect(() => {
    setSchedules(getSchedules());
    setMembers(getMembers().filter(m => m.trangThai === 'Hoạt động'));
  }, []);

  const handleOpenAttendance = (schedule: LichTap) => {
    setSelectedSchedule(schedule);
    setIsAttendanceModalOpen(true);
    setIsQrMode(false);
    setScanStatus('idle');
  };

  const toggleAttendance = (memberId: number) => {
    if (!selectedSchedule) return;
    const isPresent = selectedSchedule.thanhVienThamGia.includes(memberId);
    let newAttendance = isPresent 
      ? selectedSchedule.thanhVienThamGia.filter(id => id !== memberId)
      : [...selectedSchedule.thanhVienThamGia, memberId];

    const updatedSchedule = { ...selectedSchedule, thanhVienThamGia: newAttendance };
    const updatedSchedules = schedules.map(s => s.id === selectedSchedule.id ? updatedSchedule : s);
    setSchedules(updatedSchedules);
    setSelectedSchedule(updatedSchedule);
    saveSchedules(updatedSchedules);
  };

  const handleQrAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule || !qrInput) return;
    const cleanId = qrInput.replace(/(MEMBER-)/g, '');
    const memberId = parseInt(cleanId);
    const member = members.find(m => m.id === memberId);

    if (!member) {
      setScanStatus('error');
      setTimeout(() => setScanStatus('idle'), 1200);
    } else {
      if (!selectedSchedule.thanhVienThamGia.includes(memberId)) toggleAttendance(memberId);
      setScanStatus('success');
      setLastScanned(member.hoTen);
      setTimeout(() => setScanStatus('idle'), 2000);
    }
    setQrInput('');
    qrInputRef.current?.focus();
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newSchedule.noiDung) return;
    const schedule: LichTap = { id: Date.now(), ...newSchedule, thanhVienThamGia: [] };
    const updated = [schedule, ...schedules];
    setSchedules(updated);
    saveSchedules(updated);
    setIsAddModalOpen(false);
  };

  const filteredMembers = useMemo(() => {
    return members.filter(m => (m.hoTen + m.tenThanh).toLowerCase().includes(searchTerm.toLowerCase()));
  }, [members, searchTerm]);

  return (
    <div className="space-y-10 pb-32 animate-slide-up px-2 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-6">
        <div className="flex items-center gap-6">
           <div className="w-1.5 h-20 burgundy-gradient rounded-full"></div>
           <div>
              <h1 className="text-6xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Lịch Phụng Vụ</h1>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4 flex items-center gap-3">
                <CalendarDays size={18} className="text-amber-500" /> Quản trị hoạt động AngelChoir Pro v5.6
              </p>
           </div>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }}
          className="w-18 h-18 text-white rounded-[2.5rem] shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-4 border-white dark:border-slate-800"
        >
          <Plus size={36} strokeWidth={4} />
        </button>
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {schedules.map(s => (
          <div key={s.id} className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 shadow-xl border border-black/5 flex flex-col justify-between min-h-[460px] group transition-all hover:shadow-2xl relative overflow-hidden backdrop-blur-xl">
             <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { if(window.confirm('Gỡ bỏ lịch trình?')) { const u = schedules.filter(x => x.id !== s.id); setSchedules(u); saveSchedules(u); } }} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-md"><Trash2 size={20} /></button>
             </div>
             <div>
               <div className="flex items-center gap-5 mb-10">
                 <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[#BC8F44] shadow-inner">
                    <Clock size={24} />
                 </div>
                 <div>
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{s.ngayTap}</p>
                   <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{s.gio}</p>
                 </div>
               </div>
               <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase leading-tight line-clamp-3 mb-8 tracking-tighter drop-shadow-sm">{s.noiDung}</h3>
             </div>
             <div className="space-y-6">
               <div className="flex items-center justify-between px-8 py-5 bg-slate-50/80 dark:bg-slate-800/50 rounded-[2rem] border border-black/5 shadow-inner">
                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Hiện diện</span>
                 <div className="flex items-center gap-3">
                    <Users size={16} className="text-[#BC8F44]" />
                    <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{s.thanhVienThamGia.length}</span>
                    <span className="text-xs font-bold text-slate-400">/ {members.length}</span>
                 </div>
               </div>
               <button onClick={() => handleOpenAttendance(s)} 
                 style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }}
                 className="w-full py-6 rounded-full text-white text-[11px] font-black uppercase tracking-[0.4em] hover:opacity-90 transition-all flex items-center justify-center gap-4 shadow-xl border border-white/10"
               >
                 <ClipboardCheck size={22} strokeWidth={3} /> ĐIỂM DANH
               </button>
             </div>
          </div>
        ))}
        {schedules.length === 0 && (
          <div className="col-span-full py-40 flex flex-col items-center justify-center gap-10 opacity-10">
             <Calendar size={180} strokeWidth={1} />
             <p className="text-3xl font-black uppercase tracking-[0.8em]">Chưa cập nhật lịch trình</p>
          </div>
        )}
      </div>

      {/* Attendance Modal */}
      {isAttendanceModalOpen && selectedSchedule && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-[4rem] shadow-2xl relative border border-white/20 p-12 lg:p-16 flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">
              <button onClick={() => setIsAttendanceModalOpen(false)} className="absolute top-12 right-12 p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-xl z-10"><X size={32} /></button>
              
              <div className="mb-14 flex flex-col lg:flex-row lg:items-center justify-between gap-10 pr-28">
                  <div>
                    <h3 className="text-6xl font-black uppercase tracking-tighter dark:text-white leading-none">Hiện Diện</h3>
                    <div className="flex items-center gap-6 mt-6">
                       <span className="text-[12px] font-black text-[#BC8F44] uppercase tracking-widest bg-[#BC8F44]/10 px-6 py-2.5 rounded-2xl border border-[#BC8F44]/20">{selectedSchedule.noiDung}</span>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedSchedule.ngayTap} @ {selectedSchedule.gio}</span>
                    </div>
                  </div>
                  <div className="flex bg-slate-100 dark:bg-slate-800/80 p-2 rounded-[2.2rem] border border-black/5 shadow-inner">
                    <button onClick={() => setIsQrMode(false)} className={`px-10 py-4 rounded-[1.8rem] transition-all flex items-center gap-4 text-[10px] font-black uppercase tracking-widest ${!isQrMode ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl scale-105' : 'text-slate-400'}`}><List size={20}/> DANH SÁCH</button>
                    <button onClick={() => {setIsQrMode(true); setTimeout(() => qrInputRef.current?.focus(), 100);}} className={`px-10 py-4 rounded-[1.8rem] transition-all flex items-center gap-4 text-[10px] font-black uppercase tracking-widest ${isQrMode ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl scale-105' : 'text-slate-400'}`}><QrCode size={20}/> QUÉT MÃ QR</button>
                  </div>
              </div>

              {isQrMode ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12">
                  <div className={`w-[25rem] h-[25rem] rounded-[5rem] border-8 border-dashed transition-all flex flex-col items-center justify-center relative ${
                    scanStatus === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500 shadow-[0_0_100px_rgba(16,185,129,0.2)]' : 
                    scanStatus === 'error' ? 'bg-red-50 dark:bg-red-900/10 border-red-500 shadow-[0_0_100px_rgba(239,68,68,0.2)]' : 'bg-slate-50 dark:bg-slate-800 border-slate-200'
                  }`}>
                     <ScanLine size={120} className={`mb-10 ${scanStatus === 'success' ? 'text-emerald-500' : scanStatus === 'error' ? 'text-red-500' : 'text-blue-500 animate-pulse'}`} strokeWidth={1} />
                     <div className="text-center px-10 space-y-4">
                        {scanStatus === 'success' ? (
                          <div className="animate-in fade-in slide-in-from-bottom-5">
                             <CheckCircle2 size={50} className="text-emerald-500 mx-auto mb-4" />
                             <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{lastScanned}</p>
                          </div>
                        ) : scanStatus === 'error' ? (
                          <div className="animate-in shake duration-300">
                             <AlertCircle size={50} className="text-red-500 mx-auto mb-4" />
                             <p className="text-xl font-black text-red-600 dark:text-red-400 uppercase tracking-widest">MÃ THẺ SAI</p>
                          </div>
                        ) : (
                          <p className="text-[13px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Sẵn sàng nhận diện mã thẻ ca viên...</p>
                        )}
                     </div>
                     <form onSubmit={handleQrAttendance} className="absolute inset-0 opacity-0 overflow-hidden cursor-default">
                        <input ref={qrInputRef} type="text" value={qrInput} onChange={(e) => setQrInput(e.target.value)} onBlur={() => isQrMode && setTimeout(() => qrInputRef.current?.focus(), 100)} className="w-full h-full" autoFocus />
                     </form>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-10 relative group max-w-3xl mx-auto w-full">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                    <input type="text" placeholder="Tìm tên ca viên..." className="w-full pl-20 pr-10 py-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border-none outline-none font-bold text-xl dark:text-white shadow-inner focus:ring-8 focus:ring-black/5 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-6 no-scrollbar pb-10">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                        {filteredMembers.map(m => {
                          const isPresent = selectedSchedule.thanhVienThamGia.includes(m.id);
                          return (
                            <button key={m.id} onClick={() => toggleAttendance(m.id)} className={`p-6 rounded-[2.5rem] border-4 transition-all flex flex-col items-center text-center gap-4 group relative ${isPresent ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500 shadow-xl scale-105' : 'bg-white dark:bg-slate-900 border-transparent shadow-md hover:shadow-lg'}`}>
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all overflow-hidden border-2 ${isPresent ? 'bg-emerald-500 border-emerald-200' : 'bg-slate-50 dark:bg-slate-800 border-white shadow-sm'}`}>
                                 {isPresent ? <Check size={32} className="text-white" strokeWidth={4} /> : (m.avatar ? <img src={m.avatar} className="w-full h-full object-cover" /> : <Users size={24} className="text-slate-200" />)}
                              </div>
                              <div className="truncate w-full">
                                 <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isPresent ? 'text-emerald-600' : 'text-[#BC8F44]'}`}>{m.tenThanh}</p>
                                 <p className="text-sm font-bold truncate uppercase tracking-tight dark:text-white">{m.hoTen}</p>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </>
              )}

              <div className="mt-8 pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-10">
                 <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Thống kê hiện diện</span>
                    <div className="flex items-end gap-3 leading-none">
                       <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">{selectedSchedule.thanhVienThamGia.length}</span>
                       <span className="text-2xl font-black text-slate-300 uppercase tracking-widest mb-1">/ {members.length} ca viên</span>
                    </div>
                 </div>
                 <button onClick={() => setIsAttendanceModalOpen(false)} 
                    style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }}
                    className="px-20 py-8 text-white rounded-full text-[15px] font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-105 active:scale-95 transition-all border-2 border-white/20">
                    HOÀN TẤT ĐIỂM DANH
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-3xl z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3.5rem] p-10 shadow-2xl relative border border-white/20 animate-in zoom-in-95 duration-300">
              <button onClick={() => setIsAddModalOpen(false)} className="absolute top-8 right-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-lg"><X size={24} /></button>
              <h3 className="text-4xl font-black uppercase tracking-tighter dark:text-white mb-10">Kế Hoạch Mới</h3>
              <form onSubmit={handleAddSchedule} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Nội dung phụng sự</label>
                    <textarea required placeholder="Vd: Lễ Lá, Tập hát Giáng Sinh..." className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border-none outline-none font-bold text-lg dark:text-white shadow-inner resize-none" rows={3} value={newSchedule.noiDung} onChange={e => setNewSchedule({...newSchedule, noiDung: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Ngày tháng</label>
                       <input type="date" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold text-lg dark:text-white shadow-inner" value={newSchedule.ngayTap} onChange={e => setNewSchedule({...newSchedule, ngayTap: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Giờ bắt đầu</label>
                       <input type="time" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold text-lg dark:text-white shadow-inner" value={newSchedule.gio} onChange={e => setNewSchedule({...newSchedule, gio: e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" 
                    style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }}
                    className="w-full py-6 text-white rounded-full text-[13px] font-black uppercase tracking-[0.5em] shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-4">
                     <Save size={24} /> LƯU LỊCH TRÌNH
                  </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Schedules;
