
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Trash2, X, Edit3, Search, 
  Users, Printer, Phone,
  Award, FileSpreadsheet, Download,
  UserCircle, Camera, CheckCircle2,
  Mail, Info, PhoneCall, MapPin, 
  Clock, Check, UserPlus, Filter, 
  MoreHorizontal, ChevronRight, UserCheck, Shield,
  QrCode, UserMinus, HardDriveDownload
} from 'lucide-react';
import { getMembers, saveMembers, getSpringColor } from '../store';
import { ThanhVien, MemberRole, Status, Gender } from '../types';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const Members: React.FC = () => {
  const [members, setMembers] = useState<ThanhVien[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [editingMember, setEditingMember] = useState<ThanhVien | null>(null);
  const [formData, setFormData] = useState<Partial<ThanhVien>>({});
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const [activeTab, setActiveTab] = useState<'personal' | 'contact' | 'role'>('personal');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  const springColor = getSpringColor();
  const currentTheme = localStorage.getItem('theme') || 'light';
  const isSpring = currentTheme === 'spring';

  useEffect(() => {
    setMembers(getMembers());
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const searchStr = ((m.tenThanh || "") + " " + (m.hoTen || "") + " " + (m.soDienThoai || "")).toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'All' || m.vaiTro === filterRole;
      const matchesStatus = filterStatus === 'All' || m.trangThai === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    }).sort((a, b) => a.hoTen.localeCompare(b.hoTen));
  }, [members, searchTerm, filterRole, filterStatus]);

  const handleOpenModal = (member?: ThanhVien) => {
    if (member) {
      setEditingMember(member);
      setFormData(member);
      setAvatarPreview(member.avatar || '');
    } else {
      setEditingMember(null);
      setFormData({ 
        trangThai: Status.Active, 
        gioiTinh: Gender.Nam, 
        vaiTro: MemberRole.CaVien, 
        ngayGiaNhap: new Date().toISOString().split('T')[0], 
        points: 0,
        ghiChu: '',
      });
      setAvatarPreview('');
    }
    setActiveTab('personal');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hoTen) {
        alert("Vui lòng nhập Họ tên ca viên.");
        return;
    }
    const data: ThanhVien = { 
      ...(formData as ThanhVien), 
      avatar: avatarPreview, 
      id: editingMember ? editingMember.id : Date.now() 
    };
    const updated = editingMember ? members.map(m => m.id === editingMember.id ? data : m) : [...members, data];
    setMembers(updated);
    saveMembers(updated);
    setIsModalOpen(false);
  };

  const handleExportExcelPro = () => {
    const reportDate = new Date().toLocaleString('vi-VN');
    const wsHeader = [
      ["BAN ĐIỀU HÀNH CA ĐOÀN ANGELCHOIR"],
      ["BÁO CÁO DANH SÁCH CHI TIẾT CA VIÊN"],
      [`Thời gian kết xuất: ${reportDate}`],
      [""],
      ["STT", "Tên Thánh", "Họ và Tên", "Phái", "Vai trò / Bè", "Số điện thoại", "Ngày gia nhập", "Trạng thái"]
    ];

    const wsRows = filteredMembers.map((m, idx) => [
      idx + 1,
      m.tenThanh || "---",
      m.hoTen,
      m.gioiTinh,
      m.vaiTro,
      m.soDienThoai || "---",
      m.ngayGiaNhap || "---",
      m.trangThai
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([...wsHeader, ...wsRows]);
    worksheet['!cols'] = [{ wch: 6 }, { wch: 18 }, { wch: 25 }, { wch: 8 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }, { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách Ca Viên");
    XLSX.writeFile(workbook, `Bao_Cao_Ca_Vien_${Date.now()}.xlsx`);
  };

  const printMemberCard = async (m: ThanhVien) => {
    const element = document.getElementById(`card-template-${m.id}`);
    if (!element) return;
    setIsPrinting(true);
    try {
      await new Promise(r => setTimeout(r, 800)); // Đợi QR code load
      const canvas = await html2canvas(element, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', [54, 86]); 
      pdf.addImage(imgData, 'PNG', 0, 0, 54, 86);
      pdf.save(`The_Ca_Vien_${m.hoTen.replace(/\s+/g, '_')}.pdf`);
    } catch (err) { alert("Lỗi khi kết xuất thẻ PDF."); } finally { setIsPrinting(false); }
  };

  return (
    <div className="space-y-4 pb-24 animate-slide-up px-2 lg:px-4">
      {/* Page Header & Icon Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 border-b border-black/5">
        <div className="flex items-center gap-3">
           <div className="w-1.5 h-12 rounded-full shadow-lg" style={{ backgroundColor: isSpring ? springColor : '#0f172a' }}></div>
           <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Quản Lý Ca Viên</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hồ sơ lưu trữ điện tử AngelChoir</p>
           </div>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="flex bg-white dark:bg-slate-900 rounded-2xl p-1 shadow-sm border border-black/5">
             <button onClick={() => handleOpenModal()} className="p-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all" title="Thêm ca viên mới"><UserPlus size={20} /></button>
             <button onClick={handleExportExcelPro} className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Xuất file Excel"><FileSpreadsheet size={20} /></button>
             <button onClick={() => alert('Chức năng nhập liệu đang bảo trì')} className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Nhập dữ liệu"><HardDriveDownload size={20} /></button>
           </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-3 rounded-[1.5rem] border border-black/5 shadow-sm flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full group">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
             <input 
               type="text" 
               placeholder="Tìm theo tên hoặc số điện thoại..." 
               className="w-full pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-[1.2rem] border-none outline-none font-bold text-sm dark:text-white focus:ring-2 focus:ring-slate-200 transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 rounded-[1.2rem] border border-black/5 shadow-sm min-w-[160px]">
                <Filter size={14} className="text-slate-400" />
                <select 
                  className="bg-transparent outline-none font-black text-[10px] uppercase tracking-wider text-slate-500 cursor-pointer flex-1"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="All">TẤT CẢ VAI TRÒ</option>
                  {Object.values(MemberRole).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 rounded-[1.2rem] border border-black/5 shadow-sm min-w-[160px]">
                <UserCheck size={14} className="text-slate-400" />
                <select 
                  className="bg-transparent outline-none font-black text-[10px] uppercase tracking-wider text-slate-500 cursor-pointer flex-1"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">TRẠNG THÁI</option>
                  {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
          </div>
      </div>

      {/* List View - Optimized for space */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-black/5 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-black/5">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-12">#</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh Tính Ca Viên</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bè / Vai Trò</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Liên Lạc</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày Gia Nhập</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng Thái</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredMembers.map((m, idx) => (
                <tr key={m.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all group">
                  <td className="px-6 py-4 text-xs font-bold text-slate-300">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-black/5 overflow-hidden flex items-center justify-center shrink-0">
                        {m.avatar ? <img src={m.avatar} className="w-full h-full object-cover" /> : <UserCircle size={28} className="text-slate-200" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase leading-none mb-1">{m.tenThanh || '---'}</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none tracking-tight">{m.hoTen}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                       <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{m.vaiTro}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Phone size={14} className="text-amber-600/50" />
                      {m.soDienThoai || '---'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">
                    {m.ngayGiaNhap || '---'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      m.trangThai === Status.Active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                    }`}>
                      {m.trangThai}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => printMemberCard(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="In thẻ thành viên"><Printer size={18} /></button>
                      <button onClick={() => handleOpenModal(m)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"><Edit3 size={18} /></button>
                      <button onClick={() => { if(window.confirm('Xóa vĩnh viễn hồ sơ?')) { const u = members.filter(x => x.id !== m.id); setMembers(u); saveMembers(u); } }} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredMembers.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-slate-300 gap-6 opacity-40">
            <Users size={100} strokeWidth={1} />
            <p className="text-2xl font-black uppercase tracking-[0.5em]">Không tìm thấy dữ liệu</p>
          </div>
        )}
      </div>

      {/* MEMBER MODAL - Redesigned 3-Section Layout */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3.5rem] p-10 lg:p-14 shadow-2xl relative border border-white/10 animate-in zoom-in-95 duration-300 flex flex-col lg:flex-row gap-12 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-3" style={{ backgroundColor: isSpring ? springColor : '#0f172a' }}></div>
              
              <div className="lg:w-64 shrink-0 flex flex-col gap-8">
                 <div className="w-full aspect-square bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border-4 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden relative flex flex-col items-center justify-center group cursor-pointer shadow-inner" onClick={() => avatarInputRef.current?.click()}>
                    {avatarPreview ? (
                      <img src={avatarPreview} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center opacity-10 flex flex-col items-center gap-4">
                        <UserCircle size={80} strokeWidth={1} />
                        <span className="text-[10px] font-black uppercase tracking-widest px-6 italic">Ảnh Hồ Sơ</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Camera size={32} />
                    </div>
                    <input ref={avatarInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload = (ev) => setAvatarPreview(ev.target?.result as string); r.readAsDataURL(f); } }} />
                 </div>

                 <nav className="flex flex-col gap-2">
                   {[
                     { id: 'personal', label: 'Thông tin cá nhân', icon: UserCircle },
                     { id: 'contact', label: 'Thông tin liên hệ', icon: Mail },
                     { id: 'role', label: 'Vai trò & Trạng thái', icon: Award }
                   ].map(tab => (
                     <button 
                       key={tab.id} 
                       onClick={() => setActiveTab(tab.id as any)} 
                       className={`w-full flex items-center gap-4 px-7 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                         activeTab === tab.id 
                            ? 'bg-slate-900 text-white shadow-xl translate-x-3' 
                            : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                       }`}
                     >
                       <tab.icon size={18} /> {tab.label}
                     </button>
                   ))}
                 </nav>
              </div>

              <div className="flex-1 flex flex-col min-h-[480px]">
                 <div className="flex items-center justify-between mb-10">
                    <div>
                      <h3 className="text-4xl font-black uppercase tracking-tighter dark:text-white leading-none">Hồ Sơ Thành Viên</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 tracking-[0.2em]">Cơ sở dữ liệu AngelChoir v5.8.2</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-lg"><X size={26} /></button>
                 </div>

                 <form onSubmit={handleSave} className="flex-1 space-y-8 overflow-y-auto pr-4 no-scrollbar">
                    {activeTab === 'personal' && (
                       <div className="grid grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-300">
                          <div className="space-y-3">
                             <label className="text-[11px] font-black text-slate-400 uppercase ml-4 tracking-widest">Tên Thánh</label>
                             <input type="text" className="w-full px-7 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold text-lg dark:text-white shadow-inner" placeholder="..." value={formData.tenThanh || ''} onChange={e => setFormData({...formData, tenThanh: e.target.value})}/>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[11px] font-black text-slate-400 uppercase ml-4 tracking-widest">Họ và Tên</label>
                             <input ref={nameInputRef} type="text" required className="w-full px-7 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold text-lg dark:text-white shadow-inner" placeholder="..." value={formData.hoTen || ''} onChange={e => setFormData({...formData, hoTen: e.target.value})}/>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[11px] font-black text-slate-400 uppercase ml-4 tracking-widest">Ngày sinh</label>
                             <input type="date" className="w-full px-7 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold text-lg dark:text-white shadow-inner" value={formData.ngaySinh || ''} onChange={e => setFormData({...formData, ngaySinh: e.target.value})}/>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[11px] font-black text-slate-400 uppercase ml-4 tracking-widest">Giới tính</label>
                             <select className="w-full px-7 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold text-lg dark:text-white shadow-inner cursor-pointer" value={formData.gioiTinh} onChange={e => setFormData({...formData, gioiTinh: e.target.value as any})}><option value={Gender.Nam}>Nam</option><option value={Gender.Nu}>Nữ</option></select>
                          </div>
                       </div>
                    )}
                    
                    {activeTab === 'contact' && (
                       <div className="grid grid-cols-1 gap-8 animate-in slide-in-from-right-4 duration-300">
                          <div className="space-y-3">
                             <label className="text-[11px] font-black text-slate-400 uppercase ml-4 tracking-widest">Số điện thoại liên lạc</label>
                             <div className="relative">
                               <PhoneCall size={22} className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300" />
                               <input type="tel" className="w-full px-16 py-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border-none outline-none font-black text-2xl dark:text-white shadow-inner tracking-widest" placeholder="Không bắt buộc" value={formData.soDienThoai || ''} onChange={e => setFormData({...formData, soDienThoai: e.target.value})}/>
                             </div>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[11px] font-black text-slate-400 uppercase ml-4 tracking-widest">Địa chỉ cư trú</label>
                             <div className="relative">
                               <MapPin size={22} className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300" />
                               <input type="text" className="w-full px-16 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold text-lg dark:text-white shadow-inner" placeholder="..." value={formData.queQuan || ''} onChange={e => setFormData({...formData, queQuan: e.target.value})}/>
                             </div>
                          </div>
                       </div>
                    )}

                    {activeTab === 'role' && (
                       <div className="grid grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-300">
                          <div className="space-y-3">
                             <label className="text-[11px] font-black text-slate-400 uppercase ml-4 tracking-widest">Bè hát / Vai trò</label>
                             <select className="w-full px-7 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold text-lg dark:text-white shadow-inner cursor-pointer" value={formData.vaiTro} onChange={e => setFormData({...formData, vaiTro: e.target.value as any})}>{Object.values(MemberRole).map(r => <option key={r} value={r}>{r}</option>)}</select>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[11px] font-black text-slate-400 uppercase ml-4 tracking-widest">Trạng thái tham gia</label>
                             <select className="w-full px-7 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold text-lg dark:text-white shadow-inner cursor-pointer" value={formData.trangThai} onChange={e => setFormData({...formData, trangThai: e.target.value as any})}><option value={Status.Active}>Đang hoạt động</option><option value={Status.Inactive}>Tạm nghỉ hát</option></select>
                          </div>
                          <div className="col-span-2 space-y-3">
                             <label className="text-[11px] font-black text-slate-400 uppercase ml-4 tracking-widest">Ghi chú phụng sự</label>
                             <textarea rows={4} className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border-none outline-none font-bold text-base dark:text-white shadow-inner resize-none" value={formData.ghiChu || ''} onChange={e => setFormData({...formData, ghiChu: e.target.value})} placeholder="Thêm nhận xét về chất giọng hoặc quá trình phụng sự..."></textarea>
                          </div>
                       </div>
                    )}
                 </form>

                 <div className="pt-10 border-t border-slate-100 dark:border-slate-800 mt-auto">
                    <button type="submit" onClick={handleSave} 
                       style={{ backgroundColor: isSpring ? springColor : '#1E293B' }}
                       className="w-full py-7 text-white rounded-full text-[14px] font-black uppercase tracking-[0.4em] shadow-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-5 border-2 border-white/10">
                       <CheckCircle2 size={28} /> XÁC NHẬN LƯU HỒ SƠ
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Vertical ID Card Template - Navy/Gold Style (Hidden) */}
      <div className="fixed -left-[9999px] top-0">
        {filteredMembers.map(m => (
          <div key={m.id} id={`card-template-${m.id}`} className="w-[540px] h-[860px] relative flex flex-col overflow-hidden navy-id-card">
            {/* Gold Border Ornament */}
            <div className="absolute inset-4 border-2 border-[#c5a059] pointer-events-none opacity-50"></div>
            
            {/* Header */}
            <div className="h-[180px] flex flex-col items-center justify-center pt-8">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#c5a059] rounded-lg flex items-center justify-center shadow-lg">
                     <Users size={24} className="text-[#0f172a]" strokeWidth={3} />
                  </div>
                  <h2 className="text-[28px] font-black gold-text uppercase tracking-[0.2em] leading-none">AngelChoir</h2>
               </div>
               <div className="h-0.5 w-32 bg-[#c5a059] mb-4"></div>
               <h1 className="text-[36px] font-bold text-white uppercase tracking-[0.3em] leading-none italic">THẺ CA VIÊN</h1>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center pt-6 px-12 text-center">
               {/* Portrait */}
               <div className="w-[320px] h-[320px] rounded-full border-[10px] border-[#c5a059] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] mb-10 bg-white">
                  {m.avatar ? <img src={m.avatar} className="w-full h-full object-cover" /> : <UserCircle size={280} className="text-slate-100" />}
               </div>

               {/* Name - Serif Style */}
               <div className="space-y-4 mb-8">
                  <span className="text-[30px] font-bold gold-text uppercase italic leading-none block" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {m.tenThanh || '---'}
                  </span>
                  <h2 className="text-[48px] font-black text-white uppercase tracking-tight leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {m.hoTen}
                  </h2>
               </div>

               {/* Role Badge */}
               <div className="px-10 py-3 bg-[#c5a059] text-[#0f172a] rounded-full text-[20px] font-black uppercase tracking-[0.3em] shadow-xl mb-12">
                  {m.vaiTro}
               </div>

               {/* QR Code Section */}
               <div className="w-full flex items-center justify-between border-t border-[#c5a059]/30 pt-8">
                  <div className="text-left space-y-3">
                     <div className="flex items-center gap-3 text-white/70 text-[20px] font-bold">
                        <Phone size={20} className="gold-text" /> {m.soDienThoai || '---'}
                     </div>
                     <div className="text-[12px] font-bold gold-text uppercase tracking-widest opacity-80">Mã Số: AC-{String(m.id).slice(-6)}</div>
                     <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em]">QUẢN TRỊ VIÊN ANGELCHOIR</div>
                  </div>
                  <div className="p-4 bg-white rounded-3xl border-4 border-[#c5a059] shadow-2xl">
                     <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MEMBER-${m.id}`} className="w-24 h-24" alt="QR ID" />
                  </div>
               </div>
            </div>

            {/* Bottom Accent */}
            <div className="h-6 bg-[#c5a059] w-full"></div>
          </div>
        ))}
      </div>

      {/* Global Printing Overlay */}
      {isPrinting && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-[200] flex flex-col items-center justify-center text-white gap-8">
           <div className="w-20 h-20 border-8 border-white/10 border-t-amber-600 rounded-full animate-spin"></div>
           <p className="text-2xl font-black uppercase tracking-[0.5em] animate-pulse">ĐANG KẾT XUẤT THẺ PVC PDF...</p>
        </div>
      )}
    </div>
  );
};

export default Members;