
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calendar, Plus, CheckCircle2, X, Search, 
  Trash2, Check, Printer, QrCode, ScanLine, List,
  Music2, Target, Save, Users
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

    // QR format: BH-MEMBER-{id}
    const idString = qrInput.startsWith('BH-MEMBER-') 
      ? qrInput.split('BH-MEMBER-')[1] 
      : qrInput;
    
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
      setLastScanned(`${member.tenThanh} ${member.hoTen} (Đã hiện diện)`);
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
    <div className="space-y-10 pb-32 max-w-[1600px] mx-auto animate-in fade-in duration-700 px-4">
      <div className="flex items-center justify-between px-4">
        <div className="flex flex-col gap-1">
           <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Lịch Phụng Vụ</h2>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Điều phối công vụ AngelChoir</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-16 h-16 bg-slate-900 text-white rounded-[1.8rem] shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center border border-white/20"
        >
          <Plus size={32} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-2">
        {schedules.map(s => (
          <div key={s.id} className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-between h-[380px] group transition-all hover:shadow-lg">
             <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { if(window.confirm('Xóa?')) { const u = schedules.filter(x => x.id !== s.id); setSchedules(u); saveSchedules(u); } }} className="p-3 text-red-500 hover:bg-red-50 rounded-2xl"><Trash2 size={18} /></button>
             </div>
             <div>
               <div className="flex items-center gap-4 mb-8">
                 <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl">
                    <Calendar size={24} />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase text-slate-400">Ngày: {s.ngayTap}</span>
                   <span className="text-[12px] font-black uppercase text-slate-800">Giờ: {s.gio}</span>
                 </div>
               </div>
               <h3 className="text-xl font-black text-slate-800 uppercase leading-tight line-clamp-3 mb-6 tracking-tight">{s.noiDung}</h3>
             </div>
             <div className="space-y-4">
               <div className="flex items-center justify-between px-6 py-4 bg-slate-50 rounded-2xl border border-black/5">
                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Hiện diện</span>
                 <span className="text-sm font-black text-slate-900">{s.thanhVienThamGia.length} ca viên</span>
               </div>
               <button onClick={() => handleOpenAttendance(s)} className="w-full py-5 rounded-[2rem] border-2 border-slate-900 text-slate-900 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-4 shadow-sm">
                 <CheckCircle2 size={20} /> ĐIỂM DANH
               </button>
             </div>
          </div>
        ))}
      </div>

      {/* Advanced Attendance Modal */}
      {isAttendanceModalOpen && selectedSchedule && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-3xl z-[100] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-6xl rounded-[3.5rem] shadow-2xl relative border border-white/20 p-12 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-300">
              <button onClick={() => setIsAttendanceModalOpen(false)} className="absolute top-10 right-10 p-5 bg-slate-50 rounded-[2rem] text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-xl z-10"><X size={28} /></button>
              
              <div className="mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8 pr-24">
                  <div>
                    <h3 className="text-4xl font-black uppercase tracking-tighter">Ghi nhận hiện diện</h3>
                    <div className="flex items-center gap-4 mt-3">
                       <span className="text-[10px] font-black text-[#BC8F44] uppercase tracking-widest bg-[#BC8F44]/5 px-4 py-1.5 rounded-xl border border-[#BC8F44]/10">{selectedSchedule.noiDung}</span>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Phụng sự: {selectedSchedule.ngayTap}</span>
                    </div>
                  </div>
                  <div className="flex bg-slate-100 p-2 rounded-2xl border border-black/5 shadow-inner">
                    <button onClick={() => setIsQrMode(false)} className={`px-10 py-3.5 rounded-xl transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest ${!isQrMode ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400'}`}><List size={18}/> DANH SÁCH</button>
                    <button onClick={() => {setIsQrMode(true); setTimeout(() => qrInputRef.current?.focus(), 100);}} className={`px-10 py-3.5 rounded-xl transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest ${isQrMode ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400'}`}><QrCode size={18}/> QUÉT THẺ QR</button>
                  </div>
              </div>

              {isQrMode ? (
                <div className="flex-1 flex flex-col items-center justify-center p-10 animate-in fade-in zoom-in-95">
                  <div className={`w-96 h-96 rounded-[5rem] border-4 border-dashed transition-all flex flex-col items-center justify-center mb-12 relative overflow-hidden ${
                    scanStatus === 'success' ? 'bg-emerald-50 border-emerald-500' : 
                    scanStatus === 'error' ? 'bg-red-50 border-red-500' : 'bg-slate-50 border-slate-200'
                  }`}>
                     <ScanLine size={120} className={`mb-6 ${scanStatus === 'success' ? 'text-emerald-500' : scanStatus === 'error' ? 'text-red-500 animate-shake' : 'text-blue-500 animate-pulse'}`} />
                     <div className="text-center px-12">
                        {scanStatus === 'success' ? (
                          <div className="animate-in fade-in slide-in-from-bottom-3">
                             <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
                             <p className="text-[14px] font-black text-emerald-600 uppercase tracking-widest leading-tight">{lastScanned}</p>
                          </div>
                        ) : scanStatus === 'error' ? (
                          <div className="animate-in shake duration-300">
                             <X size={48} className="text-red-500 mx-auto mb-4" />
                             <p className="text-[14px] font-black text-red-600 uppercase tracking-widest">MÃ LỖI HOẶC KHÔNG TÌM THẤY</p>
                          </div>
                        ) : (
                          <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest leading-relaxed px-4">Đưa mã QR trên thẻ ca viên vào trước camera quét hoặc máy đọc USB...</p>
                        )}
                     </div>
                     <form onSubmit={handleQrAttendance} className="absolute inset-0 opacity-0 cursor-default">
                        <input ref={qrInputRef} type="text" value={qrInput} onChange={(e) => setQrInput(e.target.value)} onBlur={() => isQrMode && setTimeout(() => qrInputRef.current?.focus(), 100)} className="w-full h-full opacity-0" autoFocus />
                     </form>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-10 relative group max-w-2xl mx-auto w-full">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                    <input type="text" placeholder="Tìm kiếm nhanh ca viên cần điểm danh..." className="w-full pl-20 pr-12 py-7 bg-slate-50 rounded-full border-none outline-none font-bold shadow-inner text-lg focus:ring-4 focus:ring-black/5" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-6 no-scrollbar pb-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredMembers.map(m => {
                          const isPresent = selectedSchedule.thanhVienThamGia.includes(m.id);
                          return (
                            <button key={m.id} onClick={() => toggleAttendance(m.id)} className={`p-6 rounded-[2rem] border-2 transition-all flex items-center gap-5 text-left group ${isPresent ? 'bg-emerald-50 border-emerald-500 shadow-md' : 'bg-white border-transparent shadow-sm hover:border-slate-200'}`}>
                              <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-all ${isPresent ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                                 {isPresent ? <Check size={28} strokeWidth={4} /> : (m.avatar ? <img src={m.avatar} className="w-full h-full object-cover rounded-xl" /> : <Users size={24} />)}
                              </div>
                              <div className="flex flex-col truncate">
                                 <span className={`text-[10px] font-black uppercase ${isPresent ? 'text-emerald-600' : 'text-slate-400'}`}>{m.tenThanh}</span>
                                 <span className="text-sm font-bold truncate uppercase tracking-tight leading-tight">{m.hoTen}</span>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </>
              )}

              <div className="mt-8 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-8">
                 <div className="flex items-center gap-10">
                    <div className="flex flex-col">
                       <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Thực tế hiện diện</span>
                       <span className="text-3xl font-black text-slate-800 leading-none">{selectedSchedule.thanhVienThamGia.length} / {members.length} ca viên</span>
                    </div>
                 </div>
                 <button onClick={() => setIsAttendanceModalOpen(false)} className="px-16 py-7 bg-slate-900 text-white rounded-full text-[15px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all">LƯU PHIÊN ĐIỂM DANH</button>
              </div>
           </div>
        </div>
      )}

      {/* Add New Schedule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-3xl z-[100] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] p-16 shadow-2xl relative border border-white/20 animate-in zoom-in-95 duration-300">
              <button onClick={() => setIsAddModalOpen(false)} className="absolute top-10 right-10 p-5 bg-slate-50 rounded-2xl text-slate-400 hover:bg-red-500 hover:text-white transition-all"><X size={24} /></button>
              <div className="mb-12">
                 <h3 className="text-4xl font-black uppercase tracking-tighter">Thiết lập lịch mới</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Dâng hiến thời gian cho công vụ nhà Chúa</p>
              </div>
              <form onSubmit={handleAddSchedule} className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase ml-8 block">Nội dung phụng sự / Tập hát</label>
                    <textarea required placeholder="..." className="w-full px-10 py-7 bg-slate-50 rounded-[2rem] border-none outline-none font-bold shadow-inner resize-none text-lg" rows={2} value={newSchedule.noiDung} onChange={e => setNewSchedule({...newSchedule, noiDung: e.target.value})}></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <label className="text-[11px] font-black text-slate-400 uppercase ml-8 block">Ngày</label>
                       <input type="date" className="w-full px-10 py-6 bg-slate-50 rounded-2xl border-none font-bold shadow-inner" value={newSchedule.ngayTap} onChange={e => setNewSchedule({...newSchedule, ngayTap: e.target.value})}/>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[11px] font-black text-slate-400 uppercase ml-8 block">Giờ</label>
                       <input type="time" className="w-full px-10 py-6 bg-slate-50 rounded-2xl border-none font-bold shadow-inner" value={newSchedule.gio} onChange={e => setNewSchedule({...newSchedule, gio: e.target.value})}/>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-8 bg-slate-900 text-white rounded-full text-[14px] font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-4 active:scale-95">
                     <Save size={28} /> PHÊ DUYỆT PHỤNG VỤ
                  </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Schedules;
