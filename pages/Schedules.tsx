
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calendar, Clock, Plus, CheckCircle2, X, Search, 
  Trash2, Check, MapPin, Printer, QrCode, ScanLine, Zap, List
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
    setLastScanned('');
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
    
    // QR data format: BH-123456789
    const idString = qrInput.startsWith('BH-') ? qrInput.split('-')[1] : qrInput;
    const memberId = parseInt(idString);
    
    if (isNaN(memberId)) {
      setScanStatus('error');
      setTimeout(() => setScanStatus('idle'), 1500);
      setQrInput('');
      return;
    }

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
      setScanStatus('success'); // Already present is also a "success" in terms of scanning
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
    setNewSchedule({ ngayTap: new Date().toISOString().split('T')[0], gio: '19:30', noiDung: '' });
  };

  const filteredMembers = useMemo(() => {
    return members.filter(m => (m.hoTen + m.tenThanh).toLowerCase().includes(searchTerm.toLowerCase()));
  }, [members, searchTerm]);

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-700 px-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1 ml-4">
           <h2 className={`text-4xl font-black uppercase tracking-tighter ${isSpring ? 'text-slate-800' : 'text-[#354E4D] dark:text-white'}`}>Lịch Phụng Vụ</h2>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Giáo xứ Bắc Hòa - Xuân Lộc</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }}
          className="w-16 h-16 text-white rounded-[1.8rem] shadow-2xl hover:scale-110 transition-all flex items-center justify-center border border-white/20"
        >
          <Plus size={32} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {schedules.map(s => {
          const date = new Date(s.ngayTap);
          return (
            <div key={s.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-7 shadow-xl border border-slate-100 group relative flex flex-col justify-between h-[320px] transition-all hover:-translate-y-1">
               <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                 <button onClick={() => { if(window.confirm('Xóa lịch?')) { const u = schedules.filter(x => x.id !== s.id); setSchedules(u); saveSchedules(u); } }} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={14} /></button>
               </div>
               <div>
                 <div className="flex items-center gap-4 mb-6">
                    <div style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }} className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg shrink-0">
                       <span className="text-[8px] font-black uppercase opacity-60">T.{date.getMonth() + 1}</span>
                       <span className="text-xl font-black leading-none">{date.getDate()}</span>
                    </div>
                    <div>
                       <div className="flex items-center gap-1.5 mb-1"><Clock size={12} className="text-slate-400" /><span className="text-[10px] font-black uppercase text-slate-500">{s.gio}</span></div>
                       <div className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-400" /><span className="text-[10px] font-bold text-slate-400">Giáo xứ Bắc Hòa</span></div>
                    </div>
                 </div>
                 <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase leading-tight line-clamp-3 mb-4">{s.noiDung}</h3>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-black/5">
                     <span className="text-[9px] font-black uppercase text-slate-400">Hiện diện: {s.thanhVienThamGia.length} ca viên</span>
                  </div>
                  <button onClick={() => handleOpenAttendance(s)} style={{ borderColor: isSpring ? springColor : '#0F172A', color: isSpring ? springColor : '#0F172A' }} className="w-full py-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"><CheckCircle2 size={16} /> ĐIỂM DANH</button>
               </div>
            </div>
          );
        })}
      </div>

      {/* Attendance Modal */}
      {isAttendanceModalOpen && selectedSchedule && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-3xl z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-950 w-full max-w-5xl rounded-[4rem] shadow-2xl relative border border-white/20 p-8 flex flex-col max-h-[90vh]">
              <button onClick={() => setIsAttendanceModalOpen(false)} className="absolute top-8 right-8 p-4 bg-slate-50 rounded-3xl text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-lg"><X size={24} /></button>
              
              <div className="mb-8 flex items-center justify-between pr-20">
                  <div>
                    <h3 className="text-2xl font-black uppercase dark:text-white tracking-tighter">Ghi nhận tham dự</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{selectedSchedule.noiDung} - {selectedSchedule.ngayTap}</p>
                  </div>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shadow-inner">
                    <button onClick={() => setIsQrMode(false)} className={`px-5 py-2 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase ${!isQrMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}><List size={14}/> Thủ công</button>
                    <button onClick={() => {setIsQrMode(true); setTimeout(() => qrInputRef.current?.focus(), 100);}} className={`px-5 py-2 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase ${isQrMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}><QrCode size={14}/> Quét mã QR</button>
                  </div>
              </div>

              {isQrMode ? (
                <div className="flex-1 flex flex-col items-center justify-center p-10 animate-in zoom-in-95">
                  <div className={`w-72 h-72 rounded-[3.5rem] border-4 border-dashed transition-all flex flex-col items-center justify-center mb-8 relative overflow-hidden group ${
                    scanStatus === 'success' ? 'bg-emerald-50 border-emerald-500' : 
                    scanStatus === 'error' ? 'bg-red-50 border-red-500' : 'bg-slate-50 dark:bg-slate-900 border-slate-200'
                  }`}>
                     <ScanLine size={80} className={`mb-4 ${scanStatus === 'success' ? 'text-emerald-500 scale-110' : scanStatus === 'error' ? 'text-red-500' : 'text-blue-500 animate-pulse'}`} />
                     
                     <div className="text-center px-6">
                        {scanStatus === 'success' ? (
                          <div className="animate-in fade-in slide-in-from-bottom-2">
                             <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
                             <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">{lastScanned}</p>
                          </div>
                        ) : scanStatus === 'error' ? (
                          <div className="animate-in shake duration-300">
                             <X size={32} className="text-red-500 mx-auto mb-2" />
                             <p className="text-[11px] font-black text-red-600 uppercase tracking-widest">Mã không hợp lệ</p>
                          </div>
                        ) : (
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang chờ tín hiệu quét thẻ...</p>
                        )}
                     </div>
                     
                     <form onSubmit={handleQrAttendance} className="absolute inset-0 opacity-0 cursor-default">
                        <input 
                          ref={qrInputRef}
                          type="text" 
                          value={qrInput} 
                          onChange={(e) => setQrInput(e.target.value)}
                          onBlur={() => isQrMode && setTimeout(() => qrInputRef.current?.focus(), 100)}
                          className="w-full h-full opacity-0"
                          autoFocus
                        />
                     </form>
                  </div>
                  <p className="text-xs text-slate-400 font-bold max-w-sm mx-auto text-center italic">Hướng máy quét vào mã QR trên thẻ ca viên để điểm danh tự động.</p>
                </div>
              ) : (
                <>
                  <div className="mb-6 relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="text" placeholder="Tìm ca viên..." className="w-full pl-14 pr-8 py-5 bg-slate-50 rounded-[2rem] border-none outline-none font-bold shadow-inner" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredMembers.map(m => {
                          const isPresent = selectedSchedule.thanhVienThamGia.includes(m.id);
                          return (
                            <button key={m.id} onClick={() => toggleAttendance(m.id)} className={`p-4 rounded-[2rem] border-2 transition-all flex items-center gap-4 text-left ${isPresent ? 'bg-emerald-50 border-emerald-500' : 'bg-white dark:bg-slate-900 border-transparent shadow-sm'}`}>
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 ${isPresent ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                 {isPresent ? <Check size={20} strokeWidth={4} /> : (m.avatar ? <img src={m.avatar} className="w-full h-full object-cover rounded-2xl" /> : m.hoTen[0])}
                              </div>
                              <div className="flex flex-col">
                                 <span className={`text-[9px] font-black uppercase ${isPresent ? 'text-emerald-600' : 'text-slate-400'}`}>{m.tenThanh}</span>
                                 <span className="text-sm font-bold truncate dark:text-white">{m.hoTen}</span>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </>
              )}

              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <span className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Sỹ số hiện diện: {selectedSchedule.thanhVienThamGia.length} / {members.length}</span>
                    <button onClick={() => window.print()} className="p-3 bg-slate-100 rounded-xl text-slate-500 hover:text-blue-600 transition-all"><Printer size={18} /></button>
                 </div>
                 <button onClick={() => setIsAttendanceModalOpen(false)} style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }} className="px-10 py-5 text-white rounded-full text-[12px] font-black uppercase tracking-widest shadow-xl">ĐÓNG PHIÊN</button>
              </div>
           </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl relative border border-white/20">
              <button onClick={() => setIsAddModalOpen(false)} className="absolute top-10 right-10 p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-md"><X size={20} /></button>
              <h3 className="text-3xl font-black uppercase tracking-tighter mb-8 dark:text-white">Thêm lịch tập mới</h3>
              <form onSubmit={handleAddSchedule} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Nội dung buổi tập / Lễ</label>
                    <textarea required className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none outline-none font-bold shadow-inner" value={newSchedule.noiDung} onChange={e => setNewSchedule({...newSchedule, noiDung: e.target.value})}></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Ngày</label><input type="date" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none outline-none font-bold shadow-inner" value={newSchedule.ngayTap} onChange={e => setNewSchedule({...newSchedule, ngayTap: e.target.value})}/></div>
                    <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Giờ</label><input type="time" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none outline-none font-bold shadow-inner" value={newSchedule.gio} onChange={e => setNewSchedule({...newSchedule, gio: e.target.value})}/></div>
                  </div>
                  <button type="submit" style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }} className="w-full py-5 text-white rounded-3xl text-[12px] font-black uppercase tracking-[0.3em] shadow-xl hover:scale-105 transition-all">XÁC NHẬN LỊCH</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Schedules;
