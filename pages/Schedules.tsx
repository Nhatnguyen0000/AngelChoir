
import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { getSchedules, saveSchedules, getMembers, getSpringColor } from '../store';
import { LichTap, ThanhVien } from '../types';

const Schedules: React.FC = () => {
  const [schedules, setSchedules] = useState<LichTap[]>([]);
  const [members, setMembers] = useState<ThanhVien[]>([]);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<LichTap | null>(null);
  const [attendanceSearch, setAttendanceSearch] = useState('');
  
  const currentTheme = localStorage.getItem('theme') || 'light';
  const isSpring = currentTheme === 'spring';
  const springColor = getSpringColor();

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
    <div className="space-y-6 pb-20 max-w-[1500px] mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 ml-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <div style={{ backgroundColor: isSpring ? springColor : '#BC8F44' }} className="w-1.5 h-1.5 rounded-full"></div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Kế hoạch phụng vụ</p>
           </div>
           <h2 className={`text-3xl font-black uppercase tracking-tighter ${isSpring ? 'text-slate-800' : 'text-[#354E4D] dark:text-white'}`}>Lịch Hoạt Động</h2>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#354E4D' }}
          className="px-8 py-3.5 text-white rounded-full text-[9px] font-black tracking-[0.2em] uppercase shadow-lg hover:scale-105 transition-all flex items-center gap-2"
        >
          TẠO LỊCH <PlusCircle size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {schedules.map(s => (
          <div key={s.id} className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-6 shadow-md border border-white dark:border-slate-800/50 group relative hover:-translate-y-1 transition-all duration-300">
            <button 
              onClick={() => { if(window.confirm('Xóa?')) { const u = schedules.filter(x => x.id !== s.id); setSchedules(u); saveSchedules(u); } }}
              className="absolute top-5 right-5 p-2 text-slate-200 hover:text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#1E293B' }} className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white border-2 border-white dark:border-slate-700 shadow-md shrink-0">
                <span className="text-[8px] font-black uppercase tracking-tighter opacity-40 mb-0.5">T.{new Date(s.ngayTap).getMonth() + 1}</span>
                <span className="text-xl font-black tracking-tighter leading-none">{new Date(s.ngayTap).getDate()}</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-slate-400 text-[8px] font-black uppercase tracking-widest mb-1">
                  <Clock size={10} style={{ color: isSpring ? springColor : '#BC8F44' }} /> {s.gio}
                </div>
                <h3 className="text-sm font-black text-[#354E4D] dark:text-white leading-tight uppercase tracking-tight line-clamp-1">{s.noiDung}</h3>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                   {members.slice(0, 3).map(m => (
                     <div key={m.id} className="w-8 h-8 rounded-lg border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-400">
                        {getInitials(m.hoTen)}
                     </div>
                   ))}
                   {s.thanhVienThamGia.length > 0 && (
                     <div style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#354E4D' }} className="w-8 h-8 rounded-lg border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-black text-white">
                        {s.thanhVienThamGia.length}
                     </div>
                   )}
                </div>
                <span className="text-[10px] font-black text-[#BC8F44]">{Math.round((s.thanhVienThamGia.length / (members.length || 1)) * 100)}%</span>
              </div>
              <button 
                onClick={() => handleOpenAttendance(s)}
                className="w-10 h-10 bg-slate-50 dark:bg-slate-800 text-[#BC8F44] rounded-xl flex items-center justify-center hover:scale-110 transition-all border border-black/5"
              >
                <CheckCircle2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedules;
