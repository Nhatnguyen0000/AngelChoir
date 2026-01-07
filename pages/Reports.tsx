
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
  ChevronDown
} from 'lucide-react';
import { getMembers, getSchedules } from '../store';
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
    });
  }, [filteredSchedules, members]);

  const attendanceTrend = useMemo(() => {
    return filteredSchedules
      .sort((a, b) => new Date(a.ngayTap).getTime() - new Date(b.ngayTap).getTime())
      .map((s, idx) => ({
        name: `Buổi ${idx + 1}`,
        date: new Date(s.ngayTap).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        rate: Math.round((s.thanhVienThamGia.length / members.length) * 100)
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
    <div className="space-y-8 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* Redesigned Action Bar based on provided image sample */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 pr-10 shadow-2xl shadow-black/5 flex flex-wrap lg:flex-nowrap items-center justify-between gap-6 border border-white dark:border-slate-800/50">
        
        <div className="flex items-center gap-6 ml-6">
          <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-[#BC8F44] shadow-inner">
            <BarChart3 size={20} />
          </div>
          <div>
            <h2 className="text-[17px] font-black text-[#354E4D] dark:text-white uppercase tracking-tight leading-none mb-1.5">Thống Kê Tổng Hợp</h2>
            <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em]">KẾT XUẤT BÁO CÁO CHUYÊN CẦN VÀ HIỆU SUẤT</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-8 py-3 bg-slate-50 dark:bg-slate-800 rounded-full border border-black/5 justify-between min-w-[150px] group cursor-pointer hover:border-[#BC8F44]/20 transition-all">
             <div className="flex items-center gap-3">
               <Filter size={16} className="text-[#BC8F44]" />
               <select 
                 value={selectedMonth}
                 onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                 className="bg-transparent text-[10px] font-black text-slate-500 uppercase outline-none cursor-pointer tracking-widest appearance-none pr-4"
               >
                 {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                   <option key={m} value={m}>THÁNG {m}</option>
                 ))}
               </select>
             </div>
             <ChevronDown size={12} className="text-slate-300" />
          </div>

          <button 
            disabled={isExporting}
            onClick={exportToPDF}
            className="px-10 py-3 bg-[#BC8F44] text-white rounded-full text-[10px] font-black tracking-[0.1em] uppercase shadow-xl shadow-[#BC8F44]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />} 
            XUẤT BÁO CÁO PDF
          </button>
        </div>
      </div>

      <div id="report-content-to-export" className="space-y-8 bg-transparent print:bg-white print:p-10 font-report">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 px-4">
          {[
            { label: 'Buổi sinh hoạt', value: stats.totalSchedules, icon: CalendarDays, color: 'text-blue-500', bg: 'bg-blue-50/50' },
            { label: 'Chuyên cần', value: `${stats.avgAttendance}%`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50/50' },
            { label: 'Nhân sự', value: stats.activeMembers, icon: Users, color: 'text-orange-500', bg: 'bg-orange-50/50' },
            { label: 'Gương mẫu', value: stats.topContributer, icon: Award, color: 'text-purple-500', bg: 'bg-purple-50/50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-white dark:border-slate-800/50 flex flex-col items-center text-center">
              <div className={`w-12 h-12 ${stat.bg} dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-inner`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <h4 className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2">{stat.label}</h4>
              <p className="text-2xl font-black text-[#354E4D] dark:text-white tracking-tighter truncate w-full leading-none">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 print:hidden">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 shadow-xl border border-white dark:border-slate-800/50">
            <h3 className="text-lg font-black text-[#354E4D] dark:text-white uppercase tracking-widest mb-10 flex items-center gap-3">
              <TrendingUp size={20} className="text-[#BC8F44]" /> XU HƯỚNG HIỆN DIỆN
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrend}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#BC8F44" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#BC8F44" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                  />
                  <Area type="monotone" dataKey="rate" stroke="#BC8F44" strokeWidth={5} fillOpacity={1} fill="url(#colorRate)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 shadow-xl border border-white dark:border-slate-800/50">
            <h3 className="text-lg font-black text-[#354E4D] dark:text-white uppercase tracking-widest mb-10 flex items-center gap-3">
              <Music size={20} className="text-[#BC8F44]" /> HIỆU SUẤT THEO BÈ
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'black', fill: '#94a3b8'}} width={100} />
                  <Bar dataKey="rate" radius={[0, 20, 20, 0]} barSize={24}>
                    {roleData.map((e, i) => <Cell key={i} fill={['#BC8F44', '#3B82F6', '#10B981', '#6366F1', '#EC4899'][i % 5]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="px-4 pb-12">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 shadow-xl border border-white dark:border-slate-800/50 print:shadow-none print:border-none print:p-0">
            <h3 className="text-xl font-black text-[#354E4D] dark:text-white uppercase tracking-tighter mb-10">Bảng Kê Chi Tiết Phụng Vụ</h3>
            <div className="overflow-hidden rounded-[2rem] border border-slate-50 dark:border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <th className="py-6 px-8 text-[9px] font-black uppercase text-slate-400 tracking-widest">Thời gian</th>
                    <th className="py-6 px-8 text-[9px] font-black uppercase text-slate-400 tracking-widest">Nội dung</th>
                    <th className="py-6 px-8 text-center text-[9px] font-black uppercase text-slate-400 tracking-widest">Sĩ số</th>
                    <th className="py-6 px-8 text-right text-[9px] font-black uppercase text-slate-400 tracking-widest">Tỷ lệ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredSchedules.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-5 px-8 text-sm font-black text-[#354E4D] dark:text-white">{new Date(s.ngayTap).toLocaleDateString('vi-VN')}</td>
                      <td className="py-5 px-8 text-xs font-bold text-slate-500 uppercase tracking-tight">{s.noiDung}</td>
                      <td className="py-5 px-8 text-center">
                         <span className="text-[10px] font-black text-slate-400 uppercase">
                            {s.thanhVienThamGia.length} / {members.length}
                         </span>
                      </td>
                      <td className="py-5 px-8 text-right font-black text-[#BC8F44] tracking-tighter leading-none">{Math.round((s.thanhVienThamGia.length / (members.length || 1)) * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
