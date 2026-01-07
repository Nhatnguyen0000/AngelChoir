
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  Award, 
  Filter,
  Loader2,
  FileDown,
  Target,
  IdCard,
  Printer,
  QrCode,
  ChevronLeft
} from 'lucide-react';
import { getMembers, getSchedules, getSpringColor, getCurrentUser } from '../store';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  YAxis
} from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const Reports: React.FC = () => {
  const members = getMembers();
  const schedules = getSchedules();
  const currentUser = getCurrentUser();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [viewMode, setViewMode] = useState<'analytics' | 'idCards'>('analytics');

  const currentTheme = localStorage.getItem('theme') || 'light';
  const isSpring = currentTheme === 'spring';
  const springColor = getSpringColor();

  // --- ANALYTICS LOGIC ---
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

  const quarterlyData = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const data = [];

    // Get last 3 months
    for (let i = 2; i >= 0; i--) {
      const d = new Date(today.getFullYear(), currentMonth - i, 1);
      const monthNum = d.getMonth() + 1;
      const monthName = `Tháng ${monthNum}`;
      
      const monthSchedules = schedules.filter(s => {
        const sDate = new Date(s.ngayTap);
        return sDate.getMonth() === d.getMonth() && sDate.getFullYear() === d.getFullYear();
      });

      const totalSessions = monthSchedules.length;
      const totalAttendance = monthSchedules.reduce((acc, s) => acc + s.thanhVienThamGia.length, 0);
      const avg = totalSessions > 0 ? Math.round(totalAttendance / totalSessions) : 0;
      
      // Calculate engagement score (avg attendance vs total active members)
      const activeCount = members.filter(m => m.trangThai === 'Hoạt động').length;
      const engagement = activeCount > 0 ? Math.round((avg / activeCount) * 100) : 0;

      data.push({
        name: monthName,
        attendance: avg,
        engagement: engagement,
        sessions: totalSessions
      });
    }
    return data;
  }, [schedules, members]);

  const attendanceTrend = useMemo(() => {
    return filteredSchedules
      .sort((a, b) => new Date(a.ngayTap).getTime() - new Date(b.ngayTap).getTime())
      .map((s, idx) => ({
        name: `Buổi ${idx + 1}`,
        date: new Date(s.ngayTap).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        rate: Math.round((s.thanhVienThamGia.length / (members.length || 1)) * 100)
      }));
  }, [filteredSchedules, filteredSchedules.length, members.length]); // Fix dependency

  // --- EXPORT LOGIC ---
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

  const printIDCards = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 max-w-[1500px] mx-auto animate-in fade-in duration-700">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-4 px-4 print:hidden">
        <div className="flex flex-col gap-1">
           <h2 className={`text-4xl font-black uppercase tracking-tighter ${isSpring ? 'text-slate-800' : 'text-[#0F172A] dark:text-white'}`}>
             {viewMode === 'analytics' ? 'Báo cáo & Thống kê' : 'Thẻ Thành Viên'}
           </h2>
           <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em]">
             {viewMode === 'analytics' ? `TRÍCH XUẤT THÁNG ${selectedMonth}` : 'HỆ THỐNG IN THẺ TỰ ĐỘNG'}
           </p>
        </div>
        
        <div className="flex items-center gap-2">
          {viewMode === 'analytics' ? (
            <>
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
                onClick={() => setViewMode('idCards')}
                className="px-6 py-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-200 rounded-full text-[9px] font-black tracking-widest uppercase shadow-md flex items-center gap-2 hover:bg-slate-50 transition-all border border-black/5"
              >
                <IdCard size={14} /> THẺ CA VIÊN
              </button>

              <button 
                disabled={isExporting}
                onClick={exportToPDF}
                style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }}
                className="px-7 py-3 text-white rounded-full text-[9px] font-black tracking-widest uppercase shadow-md flex items-center gap-2"
              >
                {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />} 
                PDF
              </button>
            </>
          ) : (
            <>
               <button 
                onClick={() => setViewMode('analytics')}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-[9px] font-black tracking-widest uppercase shadow-md flex items-center gap-2 hover:bg-slate-200 transition-all"
              >
                <ChevronLeft size={14} /> QUAY LẠI
              </button>
              <button 
                onClick={printIDCards}
                style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }}
                className="px-7 py-3 text-white rounded-full text-[9px] font-black tracking-widest uppercase shadow-md flex items-center gap-2"
              >
                <Printer size={14} /> IN THẺ
              </button>
            </>
          )}
        </div>
      </div>

      {/* ANALYTICS VIEW */}
      {viewMode === 'analytics' && (
        <div id="report-content-to-export" className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4">
            {[
              { label: 'Tổng số buổi tập', value: stats.totalSchedules, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Tỷ lệ hiện diện TB', value: `${stats.avgAttendance}%`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Ca viên hoạt động', value: stats.activeMembers, icon: Users, color: 'text-orange-500', bg: 'bg-orange-50' },
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
            {/* Chart 1: Biến động trong tháng */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-lg border border-white dark:border-slate-800">
               <div className="flex items-center justify-between mb-8">
                 <h3 className="text-sm font-black text-[#354E4D] dark:text-white uppercase tracking-tighter">Biến động hiện diện tháng {selectedMonth}</h3>
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
                     <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                     <Area type="monotone" dataKey="rate" stroke={isSpring ? springColor : "#BC8F44"} strokeWidth={3} fill="url(#colorRate)" />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>

            {/* Chart 2: Phân tích quý (New Report Template) */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-lg border border-white dark:border-slate-800">
               <div className="flex items-center justify-between mb-8">
                 <h3 className="text-sm font-black text-[#354E4D] dark:text-white uppercase tracking-tighter">Hiệu suất Quý gần nhất</h3>
                 <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[8px] font-black uppercase tracking-widest">Quarter Analysis</div>
               </div>
               <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={quarterlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={currentTheme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                      <YAxis hide />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                      <Legend iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '10px'}} />
                      <Bar dataKey="attendance" name="TB hiện diện/buổi" fill={isSpring ? springColor : "#BC8F44"} radius={[6, 6, 0, 0]} barSize={20} />
                      <Bar dataKey="engagement" name="% Gắn kết toàn đoàn" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={20} />
                    </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* ID CARDS VIEW */}
      {viewMode === 'idCards' && (
        <div className="px-4">
          <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex items-start gap-4 print:hidden">
             <QrCode className="text-blue-500 shrink-0 mt-1" />
             <div>
                <h4 className="text-sm font-black text-blue-700 dark:text-blue-400 uppercase tracking-tight mb-1">Chế độ in thẻ định danh</h4>
                <p className="text-xs text-blue-600/80 dark:text-blue-400/70 leading-relaxed">
                  Hệ thống tự động tạo mã QR điểm danh duy nhất cho từng thành viên. <br/>
                  Khổ giấy in được tối ưu cho kích thước thẻ nhựa PVC (CR80 - 85.6mm x 54mm). Sử dụng lệnh in (Ctrl+P) để xuất ra máy in thẻ.
                </p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8 print:block print:gap-0">
             {members.filter(m => m.trangThai === 'Hoạt động').map(member => (
               <div key={member.id} className="break-inside-avoid mb-8 print:mb-4 flex flex-col sm:flex-row gap-4 print:flex-row print:gap-2">
                  
                  {/* FRONT SIDE */}
                  <div className="relative w-[324px] h-[204px] bg-white rounded-xl overflow-hidden shadow-2xl print:shadow-none border border-slate-200 print:border-black shrink-0 flex flex-col">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] to-[#172554] z-0">
                         <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                         <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#BC8F44]/20 rounded-full blur-2xl -ml-10 -mb-10"></div>
                      </div>

                      {/* Header */}
                      <div className="relative z-10 h-14 flex items-center justify-between px-4 pt-2">
                         <div className="flex flex-col">
                            <h3 className="text-[10px] font-black text-[#BC8F44] uppercase tracking-[0.2em]">Giáo Xứ Thánh Tâm</h3>
                            <h2 className="text-lg font-black text-white uppercase tracking-tighter leading-none">AngelChoir</h2>
                         </div>
                         <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                            <Award size={16} className="text-[#BC8F44]" />
                         </div>
                      </div>

                      {/* Body */}
                      <div className="relative z-10 flex-1 bg-white ml-4 mt-2 rounded-tl-[2rem] p-3 flex gap-3 shadow-[inset_4px_4px_20px_rgba(0,0,0,0.1)]">
                         {/* Photo Area */}
                         <div className="w-24 h-32 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shrink-0">
                            {member.gioiTinh === 'Nam' ? (
                               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}&gender=male`} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}&gender=female`} alt="Avatar" className="w-full h-full object-cover" />
                            )}
                         </div>
                         
                         {/* Info Area */}
                         <div className="flex flex-col justify-center gap-1">
                            <div>
                               <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Tên Thánh</p>
                               <p className="text-xs font-black text-[#BC8F44] uppercase">{member.tenThanh}</p>
                            </div>
                            <div className="mt-1">
                               <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Họ và Tên</p>
                               <p className="text-sm font-black text-slate-900 uppercase leading-tight line-clamp-2">{member.hoTen}</p>
                            </div>
                            <div className="mt-2 pt-2 border-t border-slate-100">
                               <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Vai trò</p>
                               <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[9px] font-bold uppercase border border-blue-100">{member.vaiTro}</span>
                            </div>
                         </div>
                      </div>

                      {/* Footer Strip */}
                      <div className="absolute bottom-0 left-0 w-4 h-full bg-[#BC8F44] z-20"></div>
                      <div className="absolute bottom-2 right-4 z-20">
                         <p className="text-[6px] font-bold text-slate-300 uppercase tracking-[0.2em]">THẺ CA VIÊN</p>
                      </div>
                  </div>

                  {/* BACK SIDE */}
                  <div className="relative w-[324px] h-[204px] bg-slate-50 rounded-xl overflow-hidden shadow-2xl print:shadow-none border border-slate-200 print:border-black shrink-0 flex flex-col items-center justify-center text-center p-4">
                      <div className="absolute top-2 left-0 w-full text-center">
                         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Quét mã để điểm danh</p>
                      </div>

                      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                         {/* QR Code generating API */}
                         <img 
                           src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CHECKIN-${member.id}`} 
                           alt="QR Code" 
                           className="w-24 h-24 mix-blend-multiply" 
                         />
                      </div>

                      <div className="mt-3 space-y-1">
                         <p className="text-[10px] font-mono font-black text-slate-700">{`ID: MEM-${member.id.toString().slice(-6)}`}</p>
                         <p className="text-[7px] text-slate-400 max-w-[200px] leading-tight mx-auto">
                            Thẻ này chỉ được sử dụng cho mục đích điểm danh và quản lý nội bộ ca đoàn AngelChoir.
                         </p>
                         <p className="text-[7px] font-bold text-slate-500 mt-2">Ngày cấp: {new Date().toLocaleDateString('vi-VN')}</p>
                      </div>

                      <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-[#1e3a8a] via-[#BC8F44] to-[#1e3a8a]"></div>
                  </div>

               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
