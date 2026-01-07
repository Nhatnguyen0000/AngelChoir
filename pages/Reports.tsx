
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  Award, 
  Filter,
  Loader2,
  Music,
  BarChart3,
  CalendarDays,
  FileDown,
  ChevronDown,
  ArrowRight,
  Target,
  Info
} from 'lucide-react';
import { getMembers, getSchedules, getSpringColor } from '../store';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const Reports: React.FC = () => {
  const members = getMembers();
  const schedules = getSchedules();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  const currentTheme = localStorage.getItem('theme') || 'light';
  const isSpring = currentTheme === 'spring';
  const springColor = getSpringColor();

  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => {
      const date = new Date(s.ngayTap);
      return (date.getMonth() + 1) === selectedMonth;
    });
  }, [schedules, selectedMonth]);

  const stats = useMemo(() => {
    const totalSchedules = filteredSchedules.length;
    const totalPossibleAttendances = totalSchedules * members.length;
    const actualAttendances = filteredSchedules.reduce((acc, curr) => acc + curr.thanhVienThamGia.length, 0);
    const avgAttendance = totalPossibleAttendances > 0 
      ? Math.round((actualAttendances / totalPossibleAttendances) * 100) 
      : 0;

    return {
      totalSchedules,
      avgAttendance,
      activeMembers: members.filter(m => m.trangThai === 'Hoạt động').length,
      topContributer: [...members].sort((a,b) => b.points - a.points)[0]?.hoTen || 'N/A'
    };
  }, [filteredSchedules, members]);

  const roleData = useMemo(() => {
    const roles = ['Ca trưởng', 'Nhóm trưởng', 'Nhạc công', 'Ca viên', 'Thành viên'];
    return roles.map(role => {
      const roleMembers = members.filter(m => m.vaiTro === role);
      const memberIds = roleMembers.map(m => m.id);
      let attendanceCount = 0;
      filteredSchedules.forEach(s => {
        attendanceCount += s.thanhVienThamGia.filter(id => memberIds.includes(id)).length;
      });
      const possible = filteredSchedules.length * roleMembers.length;
      const rate = possible > 0 ? Math.round((attendanceCount / possible) * 100) : 0;
      return { name: role, rate };
    }).filter(r => r.rate > 0 || members.some(m => m.vaiTro === r.name));
  }, [filteredSchedules, members]);

  const attendanceTrend = useMemo(() => {
    return filteredSchedules
      .sort((a, b) => new Date(a.ngayTap).getTime() - new Date(b.ngayTap).getTime())
      .map((s, idx) => ({
        name: `Buổi ${idx + 1}`,
        date: new Date(s.ngayTap).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        rate: Math.round((s.thanhVienThamGia.length / (members.length || 1)) * 100)
      }));
  }, [filteredSchedules, members]);

  const exportToPDF = async () => {
    setIsExporting(true);
    const element = document.getElementById('report-content-to-export');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bao_Cao_AngelChoir_T${selectedMonth}_${new Date().getFullYear()}.pdf`);
    } catch (error) {
      alert("Lỗi xuất PDF: Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-[1500px] mx-auto animate-in fade-in duration-700">
      
      <div className="flex flex-col md:flex-row items-end justify-between gap-4 px-4">
        <div className="flex flex-col gap-1">
           <h2 className={`text-4xl font-black uppercase tracking-tighter ${isSpring ? 'text-slate-800' : 'text-[#0F172A] dark:text-white'}`}>Báo cáo</h2>
           <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em]">TRÍCH XUẤT THÁNG {selectedMonth}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="px-5 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-black/5 shadow-sm flex items-center gap-2">
             <Filter size={12} style={{ color: isSpring ? springColor : '#BC8F44' }} />
             <select 
               value={selectedMonth}
               onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
               className="bg-transparent text-[9px] font-black text-slate-500 uppercase outline-none cursor-pointer"
             >
               {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                 <option key={m} value={m}>THÁNG {m}</option>
               ))}
             </select>
          </div>

          <button 
            disabled={isExporting}
            onClick={exportToPDF}
            style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }}
            className="px-7 py-3 text-white rounded-full text-[9px] font-black tracking-widest uppercase shadow-md flex items-center gap-2"
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />} 
            PDF
          </button>
        </div>
      </div>

      <div id="report-content-to-export" className="space-y-6">
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4">
          {[
            { label: 'Buổi sinh hoạt', value: stats.totalSchedules, icon: CalendarDays, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Tỷ lệ hiện diện', value: `${stats.avgAttendance}%`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'Nhân sự', value: stats.activeMembers, icon: Users, color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'Top cống hiến', value: stats.topContributer, icon: Award, color: 'text-purple-500', bg: 'bg-purple-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-5 shadow-md border border-white dark:border-slate-800 flex flex-col group">
              <div className={`w-10 h-10 ${stat.bg} dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <h4 className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">{stat.label}</h4>
              <p className={`text-xl font-black tracking-tighter truncate leading-none ${isSpring ? 'text-slate-800' : 'text-[#354E4D] dark:text-white'}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 px-4 print:hidden">
          <div className="lg:col-span-12 bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-lg border border-white dark:border-slate-800">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-sm font-black text-[#354E4D] dark:text-white uppercase tracking-tighter">Biến động hiện diện</h3>
               <TrendingUp size={16} style={{ color: isSpring ? springColor : '#BC8F44' }} className="opacity-40" />
             </div>
             <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={attendanceTrend}>
                   <defs>
                     <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor={isSpring ? springColor : "#BC8F44"} stopOpacity={0.15}/>
                       <stop offset="95%" stopColor={isSpring ? springColor : "#BC8F44"} stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={currentTheme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                   <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 'bold'}} dy={10} />
                   <Tooltip />
                   <Area type="monotone" dataKey="rate" stroke={isSpring ? springColor : "#BC8F44"} strokeWidth={4} fill="url(#colorRate)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
