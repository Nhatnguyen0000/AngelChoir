
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calendar, Clock, Plus, CheckCircle2, X, Search, 
  Trash2, Check, MapPin, Printer, QrCode, ScanLine, Zap, List,
  Music2, Star, Target, ArrowRight, Save
} from 'lucide-react';
import { getSchedules, saveSchedules, getMembers, getSpringColor } from '../store';
import { LichTap, ThanhVien } from '../types';

enum EventType {
  MassMajor = 'Lễ Trọng',
  MassNormal = 'Lễ Thường',
  Rehearsal = 'Tập Hát',
  Event = 'Sự Kiện'
}

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
    noiDung: '',
    category: EventType.MassNormal
  });

  useEffect(() => {
    setSchedules(getSchedules());
    setMembers(getMembers().filter(m => m.trangThai === 'Hoạt động'));
  }, []);

  const sortedSchedules = useMemo(() => {
    return [...schedules].sort((a, b) => new Date(b.ngayTap).getTime() - new Date(a.ngayTap).getTime());
  }, [schedules]);

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
    const idString = qrInput.startsWith('BH-') ? qrInput.split('-')[1] : qrInput;
    const memberId = parseInt(idString);
    const member = members.find(m => m.id === memberId);
    if (!member) {
      setScanStatus('error');
      setTimeout(() => setScanStatus('idle'), 1500);
      setQrInput('');
      return;
    }
    if (!selectedSchedule.thanhVienThamGia.includes(memberId)) {
      toggleAttendance(memberId);
      setScanStatus('success');
      setLastScanned(`${member.tenThanh} ${member.hoTen}`);
      setTimeout(() => setScanStatus('idle'), 2000);
    } else {
      setScanStatus('success');
      setLastScanned(`${member.tenThanh} ${member.hoTen} (Đã có mặt)`);
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

  const getCategoryStyles = (cat: string) => {
    switch(cat) {
      case EventType.MassMajor: return 'bg-red-50 text-red-600 border-red-100';
      case EventType.Rehearsal: return 'bg-blue-50 text-blue-600 border-blue-100';
      case EventType.Event: return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-10 pb-32 max-w-[1600px] mx-auto animate-in fade-in duration-700 px-4">
      <div className="flex items-center justify-between px-4">
        <div className="flex flex-col gap-1">
           <h2 className={`text-4xl font-black uppercase tracking-tighter ${isSpring ? 'text-slate-800' : 'text-[#354E4D] dark:text-white'}`}>Lịch Phụng Vụ</h2>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Giáo vụ giáo xứ Bắc Hòa - Xuân Lộc</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }}
          className="w-16 h-16 text-white rounded-[1.8rem] shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center border border-white/20"
        >
          <Plus size={32} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
        {sortedSchedules.map(s => {
          const date = new Date(s.ngayTap);
          const catStyle = getCategoryStyles((s as any).category || EventType.MassNormal);
          return (
            <div key={s.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-white dark:border-slate-800 relative flex flex-col justify-between h-[360px] group hover:-translate-y-1 transition-all">
               <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => { if(window.confirm('Xóa lịch?')) { const u = schedules.filter(x => x.id !== s.id); setSchedules(u); saveSchedules(u); } }} className="p-3 text-red-500 hover:bg-red-50 rounded-2xl"><Trash2 size={16} /></button>
               </div>
               <div>
                 <div className="flex items-center gap-4 mb-6">
                    <div style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }} className="w-16 h-16 rounded-[1.5rem] flex flex-col items-center justify-center text-white shadow-xl shrink-0">
                       <span className="text-[9px] font-black uppercase opacity-60">Thg {date.getMonth() + 1}</span>
                       <span className="text-2xl font-black leading-none">{date.getDate()}</span>
                    </div>
                    <div>
                       <div className="flex items-center gap-1.5 mb-1"><Clock size={14} className="text-slate-400" /><span className="text-[11px] font-black uppercase text-slate-600">{s.gio}</span></div>
                       <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest bg-white shadow-sm border-black/5">
                          {(s as any).category || EventType.MassNormal}
                       </div>
                    </div>
                 </div>
                 <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase leading-tight line-clamp-3 mb-6 group-hover:text-[#BC8F44] transition-colors">{s.noiDung}</h3>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-black/5">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase text-slate-400">Tham gia</span>
                        <span className="text-xs font-black text-slate-800 dark:text-white">{s.thanhVienThamGia.length} ca viên</span>
                     </div>
                     <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                        <Star size={18} className="text-amber-400" />
                     </div>
                  </div>
                  <button onClick={() => handleOpenAttendance(s)} style={{ borderColor: isSpring ? springColor : '#0F172A', color: isSpring ? springColor : '#0F172A' }} className="w-full py-5 rounded-[1.5rem] border-2 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-md"><CheckCircle2 size={18} /> ĐIỂM DANH</button>
               </div>
            </div>
          );
        })}
      </div>

      {/* Attendance Modal (Tabbed or Modal) */}
      {isAttendanceModalOpen && selectedSchedule && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-3xl z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-950 w-full max-w-6xl rounded-[4rem] shadow-2xl relative border border-white/20 p-10 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-300">
              <button onClick={() => setIsAttendanceModalOpen(false)} className="absolute top-10 right-10 p-5 bg-slate-50 rounded-[1.8rem] text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-lg"><X size={26} /></button>
              
              <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pr-20">
                  <div>
                    <h3 className="text-3xl font-black uppercase dark:text-white tracking-tighter">Ghi nhận phụng vụ</h3>
                    <div className="flex items-center gap-4 mt-3">
                       <span className="text-[10px] font-black text-[#BC8F44] uppercase tracking-widest bg-[#BC8F44]/5 px-3 py-1 rounded-lg border border-[#BC8F44]/10">{selectedSchedule.noiDung}</span>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày: {selectedSchedule.ngayTap} - Giờ: {selectedSchedule.gio}</span>
                    </div>
                  </div>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-2 rounded-[2rem] border border-black/5 shadow-inner">
                    <button onClick={() => setIsQrMode(false)} className={`px-8 py-3 rounded-2xl transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest ${!isQrMode ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400'}`}><List size={16}/> Danh sách</button>
                    <button onClick={() => {setIsQrMode(true); setTimeout(() => qrInputRef.current?.focus(), 100);}} className={`px-8 py-3 rounded-2xl transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest ${isQrMode ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400'}`}><QrCode size={16}/> Quét QR</button>
                  </div>
              </div>

              {isQrMode ? (
                <div className="flex-1 flex flex-col items-center justify-center p-10">
                  <div className={`w-80 h-80 rounded-[4rem] border-4 border-dashed transition-all flex flex-col items-center justify-center mb-10 relative overflow-hidden ${
                    scanStatus === 'success' ? 'bg-emerald-50 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.2)]' : 
                    scanStatus === 'error' ? 'bg-red-50 border-red-500' : 'bg-slate-50 dark:bg-slate-900 border-slate-200'
                  }`}>
                     <ScanLine size={100} className={`mb-4 ${scanStatus === 'success' ? 'text-emerald-500 scale-110' : scanStatus === 'error' ? 'text-red-500' : 'text-blue-500 animate-pulse'}`} />
                     <div className="text-center px-10">
                        {scanStatus === 'success' ? (
                          <div className="animate-in fade-in slide-in-from-bottom-2">
                             <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
                             <p className="text-[12px] font-black text-emerald-600 uppercase tracking-widest leading-tight">{lastScanned}</p>
                          </div>
                        ) : scanStatus === 'error' ? (
                          <div className="animate-in shake duration-300">
                             <X size={40} className="text-red-500 mx-auto mb-3" />
                             <p className="text-[12px] font-black text-red-600 uppercase tracking-widest">Mã định danh lỗi</p>
                          </div>
                        ) : (
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Vui lòng quét thẻ ca viên vào máy đọc QR...</p>
                        )}
                     </div>
                     <form onSubmit={handleQrAttendance} className="absolute inset-0 opacity-0 cursor-default">
                        <input ref={qrInputRef} type="text" value={qrInput} onChange={(e) => setQrInput(e.target.value)} onBlur={() => isQrMode && setTimeout(() => qrInputRef.current?.focus(), 100)} className="w-full h-full opacity-0" autoFocus />
                     </form>
                  </div>
                  <p className="text-xs text-slate-400 font-bold max-w-sm mx-auto text-center italic opacity-60">Tính năng này yêu cầu đầu đọc mã vạch chuyên dụng hoặc camera quét QR nội bộ.</p>
                </div>
              ) : (
                <>
                  <div className="mb-8 relative group max-w-2xl mx-auto w-full">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input type="text" placeholder="Tìm kiếm nhanh ca viên..." className="w-full pl-16 pr-10 py-6 bg-slate-50 rounded-[2.5rem] border-none outline-none font-bold shadow-inner text-base" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-4 no-scrollbar pb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {filteredMembers.map(m => {
                          const isPresent = selectedSchedule.thanhVienThamGia.includes(m.id);
                          return (
                            <button key={m.id} onClick={() => toggleAttendance(m.id)} className={`p-5 rounded-[2.2rem] border-2 transition-all flex items-center gap-4 text-left group ${isPresent ? 'bg-emerald-50 border-emerald-500 shadow-lg' : 'bg-white dark:bg-slate-900 border-transparent shadow-sm'}`}>
                              <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center font-black text-xs shrink-0 transition-all ${isPresent ? 'bg-emerald-500 text-white shadow-xl scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                 {isPresent ? <Check size={26} strokeWidth={4} /> : (m.avatar ? <img src={m.avatar} className="w-full h-full object-cover rounded-[1.2rem]" /> : m.hoTen[0])}
                              </div>
                              <div className="flex flex-col truncate">
                                 <span className={`text-[9px] font-black uppercase ${isPresent ? 'text-emerald-600' : 'text-slate-400'}`}>{m.tenThanh}</span>
                                 <span className="text-sm font-black truncate dark:text-white uppercase tracking-tight">{m.hoTen}</span>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </>
              )}

              <div className="mt-8 pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sỹ số hiện diện</span>
                       <span className="text-2xl font-black text-slate-800 dark:text-white">{selectedSchedule.thanhVienThamGia.length} / {members.length}</span>
                    </div>
                    <div className="h-10 w-px bg-slate-100"></div>
                    <div className="flex items-center gap-3">
                       <button onClick={() => window.print()} className="p-4 bg-slate-100 rounded-2xl text-slate-500 hover:text-blue-600 transition-all shadow-sm"><Printer size={20} /></button>
                       <button className="px-6 py-4 bg-slate-100 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-200 transition-all">Xuất báo cáo</button>
                    </div>
                 </div>
                 <button onClick={() => setIsAttendanceModalOpen(false)} style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }} className="px-12 py-6 text-white rounded-full text-[14px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all">LƯU PHIÊN ĐIỂM DANH</button>
              </div>
           </div>
        </div>
      )}

      {/* New Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-[3.5rem] p-12 shadow-2xl relative border border-white/20 animate-in zoom-in-95 duration-300">
              <button onClick={() => setIsAddModalOpen(false)} className="absolute top-10 right-10 p-4 bg-slate-50 rounded-[1.5rem] text-slate-400 hover:bg-red-500 hover:text-white transition-all"><X size={20} /></button>
              <div className="mb-10">
                 <h3 className="text-3xl font-black uppercase tracking-tighter dark:text-white">Thiết lập lịch mới</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Phụng sự Thiên Chúa - Phục vụ cộng đoàn</p>
              </div>
              <form onSubmit={handleAddSchedule} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-6 mb-2 block">Nội dung / Chủ đề buổi lễ</label>
                    <textarea required placeholder="Ví dụ: Lễ mừng Thánh Tâm Chúa Giêsu..." className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-none outline-none font-bold shadow-inner resize-none text-base" rows={2} value={newSchedule.noiDung} onChange={e => setNewSchedule({...newSchedule, noiDung: e.target.value})}></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-6">Ngày</label>
                       <input type="date" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 rounded-[1.8rem] border-none outline-none font-bold shadow-inner" value={newSchedule.ngayTap} onChange={e => setNewSchedule({...newSchedule, ngayTap: e.target.value})}/>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-6">Giờ</label>
                       <input type="time" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 rounded-[1.8rem] border-none outline-none font-bold shadow-inner" value={newSchedule.gio} onChange={e => setNewSchedule({...newSchedule, gio: e.target.value})}/>
                    </div>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase ml-6">Danh mục sự kiện</label>
                     <div className="grid grid-cols-2 gap-3">
                        {Object.values(EventType).map(cat => (
                           <button key={cat} type="button" onClick={() => setNewSchedule({...newSchedule, category: cat})} className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${newSchedule.category === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200'}`}>
                              {cat}
                           </button>
                        ))}
                     </div>
                  </div>
                  {/* Fixed: Use Save icon which is now imported */}
                  <button type="submit" style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }} className="w-full py-6 text-white rounded-full text-[13px] font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-4">
                     <Save className="w-6 h-6" /> XÁC NHẬN PHỤNG VỤ
                  </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Schedules;
