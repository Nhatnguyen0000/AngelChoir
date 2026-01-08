
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Trash2, X, Edit3, Search, 
  Users, ShieldCheck, Contact2, Fingerprint,
  Camera, Printer, CreditCard, List,
  Music2, CheckCircle2, FileSpreadsheet, MapPin, Loader2,
  Filter, RotateCcw, ChevronDown, Calendar
} from 'lucide-react';
import { getMembers, saveMembers, getSpringColor } from '../store';
import { ThanhVien, MemberRole, Status, Gender } from '../types';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

type ModalTab = 'personal' | 'contact' | 'role';

interface FilterState {
  gender: string;
  role: string;
  status: string;
  joinDateStart: string;
  joinDateEnd: string;
  dobStart: string;
  dobEnd: string;
}

const INITIAL_FILTERS: FilterState = {
  gender: 'Tất cả',
  role: 'Tất cả',
  status: 'Tất cả',
  joinDateStart: '',
  joinDateEnd: '',
  dobStart: '',
  dobEnd: '',
};

const Members: React.FC = () => {
  const [members, setMembers] = useState<ThanhVien[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'id-cards'>(() => (localStorage.getItem('memberViewMode') as any) || 'list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>('personal');
  const [editingMember, setEditingMember] = useState<ThanhVien | null>(null);
  const [formData, setFormData] = useState<Partial<ThanhVien>>({});
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>(() => {
    const saved = localStorage.getItem('memberFilters');
    return saved ? JSON.parse(saved) : INITIAL_FILTERS;
  });

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const springColor = getSpringColor();
  const currentTheme = localStorage.getItem('theme') || 'light';
  const isSpring = currentTheme === 'spring';

  useEffect(() => {
    setMembers(getMembers());
  }, []);

  useEffect(() => {
    localStorage.setItem('memberFilters', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem('memberViewMode', viewMode);
  }, [viewMode]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchSearch = (m.hoTen + m.tenThanh).toLowerCase().includes(searchTerm.toLowerCase());
      const matchGender = filters.gender === 'Tất cả' || m.gioiTinh === filters.gender;
      const matchRole = filters.role === 'Tất cả' || m.vaiTro === filters.role;
      const matchStatus = filters.status === 'Tất cả' || m.trangThai === filters.status;
      const matchJoinStart = !filters.joinDateStart || m.ngayGiaNhap >= filters.joinDateStart;
      const matchJoinEnd = !filters.joinDateEnd || m.ngayGiaNhap <= filters.joinDateEnd;
      const matchDobStart = !filters.dobStart || m.ngaySinh >= filters.dobStart;
      const matchDobEnd = !filters.dobEnd || m.ngaySinh <= filters.dobEnd;

      return matchSearch && matchGender && matchRole && matchStatus && 
             matchJoinStart && matchJoinEnd && matchDobStart && matchDobEnd;
    }).sort((a, b) => a.hoTen.localeCompare(b.hoTen));
  }, [members, searchTerm, filters]);

  const handleOpenModal = (member?: ThanhVien) => {
    setActiveTab('personal');
    if (member) {
      setEditingMember(member);
      setFormData(member);
      setAvatarPreview(member.avatar || '');
    } else {
      setEditingMember(null);
      setFormData({ trangThai: Status.Active, gioiTinh: Gender.Nam, vaiTro: MemberRole.CaVien, ngayGiaNhap: new Date().toISOString().split('T')[0] });
      setAvatarPreview('');
    }
    setIsModalOpen(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hoTen || !formData.tenThanh) {
      alert("Vui lòng điền đủ Tên Thánh và Họ Tên.");
      return;
    }
    const memberData: ThanhVien = {
      ...(formData as ThanhVien),
      avatar: avatarPreview,
      id: editingMember ? editingMember.id : Date.now(),
      points: editingMember ? editingMember.points : 0
    };
    const updated = editingMember ? members.map(m => m.id === editingMember.id ? memberData : m) : [...members, memberData];
    setMembers(updated);
    saveMembers(updated);
    setIsModalOpen(false);
  };

  const exportExcel = () => {
    // Tạo cấu trúc dữ liệu báo cáo đẹp mắt
    const reportHeader = [
      ["GIÁO XỨ BẮC HÒA - CA ĐOÀN ANGELCHOIR"],
      ["BÁO CÁO DANH SÁCH THÀNH VIÊN"],
      [`Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}`],
      [], // Dòng trống
      ["STT", "TÊN THÁNH", "HỌ VÀ TÊN", "NGÀY SINH", "GIỚI TÍNH", "VAI TRÒ", "SỐ ĐIỆN THOẠI", "NGÀY GIA NHẬP", "TRẠNG THÁI", "GHI CHÚ"]
    ];

    const reportData = filteredMembers.map((m, i) => [
      i + 1,
      m.tenThanh,
      m.hoTen,
      m.ngaySinh,
      m.gioiTinh,
      m.vaiTro,
      m.soDienThoai || 'N/A',
      m.ngayGiaNhap,
      m.trangThai,
      m.ghiChu || ''
    ]);

    const finalAOA = [...reportHeader, ...reportData];
    const ws = XLSX.utils.aoa_to_sheet(finalAOA);
    
    // Căn chỉnh độ rộng cột
    const wscols = [
      {wch: 6},  // STT
      {wch: 15}, // Tên Thánh
      {wch: 30}, // Họ Tên
      {wch: 15}, // Ngày sinh
      {wch: 10}, // Giới tính
      {wch: 25}, // Vai trò
      {wch: 15}, // Số điện thoại
      {wch: 15}, // Ngày gia nhập
      {wch: 15}, // Trạng thái
      {wch: 40}  // Ghi chú
    ];
    ws['!cols'] = wscols;

    // Merge tiêu đề
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }, // Merge dòng 1
      { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } }, // Merge dòng 2
      { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } }  // Merge dòng 3
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BÁO CÁO");
    XLSX.writeFile(wb, `Bao_Cao_Ca_Vien_${Date.now()}.xlsx`);
  };

  const printToPDF = async () => {
    if (filteredMembers.length === 0) return;
    setIsPrinting(true);
    setViewMode('id-cards');
    
    // Đợi UI render ổn định
    await new Promise(r => setTimeout(r, 1500));

    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = 10;
    const cardWidthMM = 86; 
    const cardHeightMM = 54; 
    
    let currentX = margin;
    let currentY = margin;

    for (let i = 0; i < filteredMembers.length; i++) {
      const m = filteredMembers[i];
      const element = document.getElementById(`card-front-${m.id}`);
      if (element) {
        const canvas = await html2canvas(element, { 
          scale: 4, 
          useCORS: true,
          logging: false,
          backgroundColor: '#1a2333',
          onclone: (clonedDoc) => {
             const el = clonedDoc.getElementById(`card-front-${m.id}`);
             if (el) {
                // Đảm bảo font Times New Roman được giữ nguyên khi capture
                el.style.fontFamily = "'Times New Roman', serif";
             }
          }
        });
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', currentX, currentY, cardWidthMM, cardHeightMM);
        
        if ((i + 1) % 2 === 0) {
          currentX = margin;
          currentY += cardHeightMM + 8;
        } else {
          currentX += cardWidthMM + 8;
        }

        if (currentY + cardHeightMM > 297 - margin && i < filteredMembers.length - 1) {
          pdf.addPage();
          currentX = margin;
          currentY = margin;
        }
      }
    }

    pdf.save(`ID_CARDS_ANGELCHOIR_${Date.now()}.pdf`);
    setIsPrinting(false);
  };

  const inputClasses = "w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none outline-none font-bold text-sm shadow-inner focus:ring-2 focus:ring-[#BC8F44]/20 transition-all";

  return (
    <div className="space-y-6 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-500 px-4">
      {/* Control Bar - Khôi phục nút Excel */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] p-4 shadow-xl flex flex-col gap-4 border border-white dark:border-slate-800 print:hidden transition-all">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" placeholder="Tìm kiếm ca viên..."
                className="w-full pl-12 pr-6 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border-none outline-none text-sm font-bold shadow-inner"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shadow-inner">
              <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-[#BC8F44] shadow-md' : 'text-slate-400'}`}><List size={18} /></button>
              <button onClick={() => setViewMode('id-cards')} className={`p-3 rounded-xl transition-all ${viewMode === 'id-cards' ? 'bg-white text-[#BC8F44] shadow-md' : 'text-slate-400'}`}><CreditCard size={18} /></button>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            {/* Nút Xuất Excel Mới - Emerald Icon Style */}
            <button 
              onClick={exportExcel} 
              className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:scale-110 active:scale-95 transition-all border border-emerald-100 shadow-sm flex items-center justify-center group"
              title="Xuất báo cáo Excel"
            >
              <FileSpreadsheet size={24} className="group-hover:rotate-6 transition-transform" />
            </button>
            
            <button onClick={printToPDF} disabled={isPrinting} className="px-6 py-4 bg-blue-50 text-blue-600 rounded-2xl hover:scale-105 active:scale-95 transition-all border border-blue-100 flex items-center gap-3">
              {isPrinting ? <Loader2 className="animate-spin" size={20} /> : <Printer size={20} />}
              <span className="text-[11px] font-black uppercase tracking-widest">In Thẻ PDF</span>
            </button>
            
            <button onClick={() => handleOpenModal()} style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }} className="w-14 h-14 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all border-4 border-white/20"><Plus size={28} /></button>
          </div>
        </div>
      </div>

      {/* Grid Rendering */}
      {viewMode === 'list' ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hồ sơ</th>
                    <th className="py-5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày sinh</th>
                    <th className="py-5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vai trò</th>
                    <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredMembers.map(m => (
                    <tr key={m.id} className="group hover:bg-slate-50 transition-all">
                      <td className="py-4 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                            {m.avatar ? <img src={m.avatar} className="w-full h-full object-cover" /> : <Users size={18} className="text-slate-300" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-[#BC8F44] tracking-widest mb-1">{m.tenThanh}</span>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-none">{m.hoTen}</h4>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs font-bold text-slate-500">{m.ngaySinh}</td>
                      <td className="py-4 px-4 text-[9px] font-black text-slate-500 uppercase">{m.vaiTro}</td>
                      <td className="py-4 px-8 text-center">
                        <div className="flex items-center justify-center gap-1">
                           <button onClick={() => handleOpenModal(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl"><Edit3 size={16} /></button>
                           <button onClick={() => { if(window.confirm('Xóa?')) { const u = members.filter(x => x.id !== m.id); setMembers(u); saveMembers(u); } }} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 justify-items-center animate-in zoom-in-95 duration-500">
           {filteredMembers.map(m => (
             <div key={m.id} className="flex flex-col gap-4 items-center break-inside-avoid">
                {/* ID CARD REDESIGN - FIXED NO OVERLAP & TIMES NEW ROMAN FORCE */}
                <div id={`card-front-${m.id}`} className="id-card-render shadow-2xl overflow-hidden flex flex-col" style={{fontFamily: "'Times New Roman', Times, serif"}}>
                    <div className="absolute inset-0 bg-[#1a2333]"></div>
                    {/* Artistic decorative layer */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#BC8F44]/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                    
                    {/* Header: Cố định độ cao và khoảng cách */}
                    <div className="relative z-10 p-5 flex items-center justify-between border-b border-white/5 h-[72px]">
                       <div className="flex items-center gap-3">
                          <Music2 size={24} className="text-[#BC8F44]" />
                          <div className="flex flex-col">
                            <h3 className="text-[13px] font-black text-white uppercase tracking-tighter leading-none m-0">ANGELCHOIR</h3>
                            <p className="text-[7px] font-black text-[#BC8F44]/70 uppercase tracking-[0.2em] mt-1 m-0">HỆ THỐNG QUẢN LÝ</p>
                          </div>
                       </div>
                       <div className="text-right">
                         <p className="text-[11px] font-black text-white uppercase tracking-widest leading-none m-0">GIÁO XỨ BẮC HÒA</p>
                         <p className="text-[7px] font-black text-[#BC8F44]/70 uppercase tracking-[0.1em] mt-1 m-0">GP. XUÂN LỘC</p>
                       </div>
                    </div>

                    {/* Content Section: Dùng Flex-row để phân vùng rõ rệt, không Absolute đè nhau */}
                    <div className="relative z-10 flex-1 flex p-5 items-center gap-6">
                       
                       {/* Zone 1: Avatar (Kích thước cố định) */}
                       <div className="w-[110px] h-[140px] bg-[#141b29] rounded-[1.8rem] border-[1.5px] border-[#BC8F44]/40 overflow-hidden shadow-2xl shrink-0 flex items-center justify-center relative">
                          {m.avatar ? <img src={m.avatar} className="w-full h-full object-cover" /> : <Users size={40} className="text-slate-700" />}
                          <div className="absolute bottom-2 right-2 w-2.5 h-2.5 bg-[#BC8F44] rotate-45 border border-white/10"></div>
                       </div>
                       
                       {/* Zone 2: Information - Sử dụng Flex-column để Tên không bị đè */}
                       <div className="flex-1 flex flex-col justify-center min-w-0">
                          {/* Stack Tên Thánh & Họ Tên - Giải quyết dứt điểm lỗi che chữ */}
                          <div className="flex flex-col gap-1.5 mb-5 force-render-text">
                             <span className="text-[15px] font-bold text-[#BC8F44] uppercase leading-none block">
                               {m.tenThanh}
                             </span>
                             <h2 className="text-[20px] font-black text-white uppercase leading-[1.1] m-0 line-clamp-2" style={{ fontFamily: "'Times New Roman', serif" }}>
                                {m.hoTen}
                             </h2>
                          </div>
                          
                          {/* Grid Thông tin phụ */}
                          <div className="grid grid-cols-2 gap-x-2 gap-y-3 pt-3 border-t border-white/5">
                             <div className="flex flex-col">
                                <span className="text-[6px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Ngày sinh</span>
                                <span className="text-[11px] font-bold text-white/80">{m.ngaySinh}</span>
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[6px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Giới tính</span>
                                <span className="text-[11px] font-bold text-white/80">{m.gioiTinh}</span>
                             </div>
                             <div className="col-span-2 mt-2">
                                <div className="inline-block px-4 py-1.5 bg-[#BC8F44] text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg">
                                  {m.vaiTro}
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Zone 3: QR Code - Tách biệt ở bên phải */}
                       <div className="flex flex-col items-center gap-2 shrink-0 ml-auto border-l border-white/5 pl-5">
                          <div className="bg-white p-1 rounded-xl shadow-2xl">
                             <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=BH-${m.id}`} className="w-[68px] h-[68px]" alt="QR" />
                          </div>
                          <span className="text-[7px] font-black text-[#BC8F44]/80 uppercase tracking-[0.1em]">VERIFY ID</span>
                       </div>
                    </div>

                    {/* Footer: Dải bảo mật */}
                    <div className="relative z-10 h-10 bg-black/40 backdrop-blur-md px-6 flex items-center justify-between border-t border-white/5">
                       <div className="flex items-center gap-2">
                          <Fingerprint size={12} className="text-[#BC8F44]/50" />
                          <span className="text-[11px] font-mono font-bold text-white/30 tracking-[0.25em]">BH-{String(m.id).slice(-6)}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#BC8F44]/40"></div>
                          <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">OFFICIAL MEMBER</span>
                       </div>
                    </div>
                </div>
                
                {/* Actions on Web */}
                <div className="flex gap-2 print:hidden mt-2">
                   <button onClick={() => handleOpenModal(m)} className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-md text-blue-600 hover:scale-110 transition-all border border-black/5"><Edit3 size={16} /></button>
                   <button onClick={() => { if(window.confirm('Xóa?')) { const u = members.filter(x => x.id !== m.id); setMembers(u); saveMembers(u); } }} className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-md text-red-500 hover:scale-110 transition-all border border-black/5"><Trash2 size={16} /></button>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Member Modal - REDESIGNED WITH TABS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-3xl z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-950 w-full max-w-4xl rounded-[3.5rem] shadow-2xl relative border border-white/20 p-8 flex flex-col lg:flex-row gap-10 max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Sidebar Navigation */}
              <div className="lg:w-64 flex flex-col gap-6 shrink-0">
                 <div className="relative group mx-auto">
                    <div className="w-48 h-60 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-4 border-dashed border-slate-200 overflow-hidden flex items-center justify-center">
                       {avatarPreview ? <img src={avatarPreview} className="w-full h-full object-cover" /> : <div className="text-center opacity-30"><Camera size={40} className="mx-auto" /><span className="text-[10px] font-black uppercase">Ảnh thẻ</span></div>}
                    </div>
                    <button onClick={() => avatarInputRef.current?.click()} className="absolute -bottom-4 -right-4 w-12 h-12 bg-[#BC8F44] text-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-white transition-transform hover:scale-110"><Plus size={24} /></button>
                    <input ref={avatarInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                 </div>
                 <nav className="flex flex-col gap-2">
                    <button onClick={() => setActiveTab('personal')} className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'personal' ? 'bg-[#BC8F44] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}><Contact2 size={18} /> Thông tin cá nhân</button>
                    <button onClick={() => setActiveTab('contact')} className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'contact' ? 'bg-[#BC8F44] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}><MapPin size={18} /> Thông tin liên hệ</button>
                    <button onClick={() => setActiveTab('role')} className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'role' ? 'bg-[#BC8F44] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}><ShieldCheck size={18} /> Vai trò & Trạng thái</button>
                 </nav>
              </div>
              
              {/* Content Panel */}
              <div className="flex-1 flex flex-col overflow-hidden">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-3xl font-black uppercase tracking-tighter dark:text-white leading-none">{editingMember ? 'Cập Nhật Hồ Sơ' : 'Thêm Ca Viên Mới'}</h3>
                      <p className="text-[10px] font-black text-[#BC8F44] uppercase tracking-widest mt-2">Dữ liệu được lưu trữ bảo mật trên hệ thống AngelChoir</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-red-500 hover:text-white transition-all"><X size={24} /></button>
                 </div>
                 
                 <form onSubmit={handleSave} className="flex-1 overflow-y-auto pr-4 no-scrollbar space-y-6">
                    {activeTab === 'personal' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Tên Thánh</label>
                               <input type="text" placeholder="Vd: Giuse, Maria..." required className={inputClasses} value={formData.tenThanh || ''} onChange={e => setFormData({...formData, tenThanh: e.target.value})}/>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Họ và Tên</label>
                               <input type="text" placeholder="Vd: Nguyễn Văn A" required className={inputClasses} value={formData.hoTen || ''} onChange={e => setFormData({...formData, hoTen: e.target.value})}/>
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Ngày sinh</label>
                               <input type="date" className={inputClasses} value={formData.ngaySinh || ''} onChange={e => setFormData({...formData, ngaySinh: e.target.value})}/>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Giới tính</label>
                               <select className={inputClasses} value={formData.gioiTinh} onChange={e => setFormData({...formData, gioiTinh: e.target.value as Gender})}>{Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}</select>
                            </div>
                         </div>
                      </div>
                    )}
                    
                    {activeTab === 'contact' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Số điện thoại</label>
                            <input type="tel" placeholder="0xxx xxx xxx" className={inputClasses} value={formData.soDienThoai || ''} onChange={e => setFormData({...formData, soDienThoai: e.target.value})}/>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Địa chỉ / Quê quán</label>
                            <textarea rows={3} placeholder="Nhập địa chỉ cư trú..." className={inputClasses + " resize-none"} value={formData.queQuan || ''} onChange={e => setFormData({...formData, queQuan: e.target.value})}></textarea>
                         </div>
                      </div>
                    )}
                    
                    {activeTab === 'role' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Vai trò</label>
                               <select className={inputClasses} value={formData.vaiTro} onChange={e => setFormData({...formData, vaiTro: e.target.value as MemberRole})}>{Object.values(MemberRole).map(r => <option key={r} value={r}>{r}</option>)}</select>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Trạng thái</label>
                               <select className={inputClasses} value={formData.trangThai} onChange={e => setFormData({...formData, trangThai: e.target.value as Status})}>{Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}</select>
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Ngày gia nhập ca đoàn</label>
                            <input type="date" className={inputClasses} value={formData.ngayGiaNhap || ''} onChange={e => setFormData({...formData, ngayGiaNhap: e.target.value})}/>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Ghi chú bổ sung</label>
                            <textarea rows={2} placeholder="Năng khiếu, đạo đức, nhạc cụ..." className={inputClasses + " resize-none"} value={formData.ghiChu || ''} onChange={e => setFormData({...formData, ghiChu: e.target.value})}></textarea>
                         </div>
                      </div>
                    )}
                 </form>
                 
                 <div className="mt-8 pt-8 border-t border-slate-50 flex gap-4">
                    <button onClick={handleSave} style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }} className="flex-1 py-5 text-white rounded-3xl text-[12px] font-black uppercase tracking-[0.3em] shadow-xl hover:opacity-90 flex items-center justify-center gap-3 transition-transform active:scale-95"><CheckCircle2 size={20} /> LƯU THÔNG TIN</button>
                    <button onClick={() => setIsModalOpen(false)} className="px-10 py-5 bg-slate-100 text-slate-500 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">ĐÓNG</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Members;
