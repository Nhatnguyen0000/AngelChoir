
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Users, Award, Filter, Loader2, FileDown, 
  Target, ChevronLeft, BarChart3, Activity, Calendar
} from 'lucide-react';
import { getMembers, getSchedules, getSpringColor } from '../store';
import { 
  AreaChart, Area, XAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, YAxis
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

  const attendanceTrend = useMemo(() => {
    return filteredSchedules
      .sort((a, b) => new Date(a.ngayTap).getTime() - new Date(b.ngayTap).getTime())
      .map((s, idx) => ({
        name: `Lễ ${idx + 1}`,
        date: new Date(s.ngayTap).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        rate: Math.round((s.thanhVienThamGia.length / (members.length || 1)) * 100)
      }));
  }, [filteredSchedules, members.length]);

  const exportToPDF = async () => {
    setIsExporting(true);
    const element = document.getElementById('report-content-to-export');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bao_Cao_AngelChoir_T${selectedMonth}.pdf`);
    } catch (error) {
      alert("Lỗi xuất PDF.");
    } finally { setIsExporting(false); }
  };

  return (
    <div className="space-y-8 pb-20 max-w-[1500px] mx-auto animate-in fade-in duration-700 px-4">
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 px-2">
        <div className="flex flex-col gap-1">
           <h2 className={`text-3xl font-black uppercase tracking-tighter ${isSpring ? 'text-slate-800' : 'text-[#0F172A] dark:text-white'}`}>Báo cáo chuyên sâu</h2>
           <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em]">TRÍCH XUẤT DỮ LIỆU ĐIỆN TỬ - THÁNG {selectedMonth}</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="px-5 py-3 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-black/5 shadow-sm flex items-center gap-3">
              <Filter size={14} className="text-amber-500" />
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="bg-transparent text-[10px] font-black text-slate-500 uppercase outline-none cursor-pointer">
                {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>THÁNG {m}</option>)}
              </select>
           </div>
           <button 
             disabled={isExporting} 
             onClick={exportToPDF} 
             style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }} 
             className="px-8 py-4 text-white rounded-[1.5rem] text-[10px] font-black tracking-widest uppercase shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
           >
              {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />} 
              XUẤT PDF
           </button>
        </div>
      </div>

      <div id="report-content-to-export" className="space-y-8 px-2">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Tổng Phụng Vụ', value: stats.totalSchedules, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Hiện diện TB', value: `${stats.avgAttendance}%`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'Ca viên thực tế', value: stats.activeMembers, icon: Users, color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'Gương mẫu nhất', value: stats.topContributer, icon: Award, color: 'text-purple-500', bg: 'bg-purple-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[2rem] p-6 shadow-lg border border-white dark:border-slate-800 flex flex-col group transition-all hover:shadow-2xl">
              <div className={`w-12 h-12 ${stat.bg} dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-5 shadow-inner`}><stat.icon size={22} className={stat.color} /></div>
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</h4>
              <p className={`text-xl font-black tracking-tighter truncate leading-none ${isSpring ? 'text-slate-800' : 'text-[#354E4D] dark:text-white'}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-8">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-xl border border-white dark:border-slate-800">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-sm font-black text-[#354E4D] dark:text-white uppercase tracking-tighter flex items-center gap-3">
                    <Activity size={20} className="text-emerald-500" /> Phân tích tần suất hiện diện
                  </h3>
                  <div className="flex items-center gap-4 text-[10px] font-black text-slate-400">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> Tỷ lệ %</div>
                  </div>
               </div>
               <div className="h-80 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={attendanceTrend}>
                     <defs>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isSpring ? springColor : "#10B981"} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={isSpring ? springColor : "#10B981"} stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={currentTheme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                     <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} dx={-10} />
                     <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                     <Area type="monotone" dataKey="rate" stroke={isSpring ? springColor : "#10B981"} strokeWidth={4} fill="url(#colorRate)" />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-xl border border-black/5 flex flex-col items-center justify-center space-y-4 opacity-50">
           <BarChart3 size={40} className="text-slate-300" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dữ liệu đối soát tài chính đang được đồng bộ...</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
