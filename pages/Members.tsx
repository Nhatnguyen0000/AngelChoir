
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Trash2, X, Edit3, Search, 
  Users, Printer, Mail, UserCircle,
  Camera, Check, Phone,
  Fingerprint, Loader2, MapPin, Download,
  Award, ChevronDown, FileSpreadsheet,
  Settings2
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
  
  // Filtering & Searching
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'personal' | 'contact' | 'role'>('personal');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  
  const springColor = getSpringColor();
  const currentTheme = localStorage.getItem('theme') || 'light';
  const isSpring = currentTheme === 'spring';

  useEffect(() => {
    setMembers(getMembers());
    
    // Close filter dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const searchStr = (m.tenThanh + " " + m.hoTen).toLowerCase();
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
        queQuan: 'Bắc Hòa',
        soDienThoai: ''
      });
      setAvatarPreview('');
    }
    setActiveTab('personal');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hoTen) {
        alert("Vui lòng nhập Họ và Tên ca viên.");
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

  const exportExcelPro = () => {
    const dataToExport = filteredMembers.map((m, idx) => ({
      'STT': idx + 1,
      'Tên Thánh': m.tenThanh,
      'Họ và Tên': m.hoTen,
      'Ngày Sinh': m.ngaySinh || 'N/A',
      'Giới tính': m.gioiTinh,
      'Vai trò': m.vaiTro,
      'Số điện thoại': m.soDienThoai || 'N/A',
      'Ngày tham gia': m.ngayGiaNhap,
      'Trạng thái': m.trangThai,
      'Ghi chú': m.ghiChu || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const wscols = [{wch: 6}, {wch: 22}, {wch: 35}, {wch: 18}, {wch: 12}, {wch: 25}, {wch: 20}, {wch: 20}, {wch: 22}, {wch: 45}];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DANH SACH CA VIEN');
    XLSX.writeFile(workbook, `AngelChoir_Export_Pro_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const printMemberCard = async (m: ThanhVien) => {
    const element = document.getElementById(`print-template-${m.id}`);
    if (!element) return;
    setIsPrinting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const canvas = await html2canvas(element, { scale: 4, useCORS: true, backgroundColor: '#ffffff', logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', [54, 86]); 
      pdf.addImage(imgData, 'PNG', 0, 0, 54, 86);
      pdf.save(`THE_CA_VIEN_${m.hoTen.toUpperCase().replace(/\s/g, '_')}.pdf`);
    } catch (err) { console.error(err); } finally { setIsPrinting(false); }
  };

  const handleBatchPrint = async () => {
    if (filteredMembers.length === 0) return;
    if (filteredMembers.length > 5) if (!window.confirm(`Hệ thống đang chuẩn bị in ${filteredMembers.length} thẻ...`)) return;
    for (const m of filteredMembers) {
      await printMemberCard(m);
      await new Promise(r => setTimeout(r, 1000));
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-6 pb-40 animate-in fade-in duration-700 font-times">
      
      {/* Optimized Smart Toolbar */}
      <div className="flex flex-col lg:flex-row items-center gap-4 mt-6">
        
        {/* Search & Combined Filter */}
        <div className="flex flex-1 items-center gap-3 w-full">
           <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-1 flex items-center shadow-md border border-slate-100 dark:border-slate-800 focus-within:ring-2 focus-within:ring-red-900/10 transition-all">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  placeholder="Tìm kiếm ca viên..."
                  className="w-full pl-6 pr-12 py-3.5 bg-transparent border-none outline-none text-base font-bold placeholder:text-slate-400 dark:text-white"
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              </div>
           </div>

           {/* Merged Filter Button */}
           <div className="relative" ref={filterRef}>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-sm border ${isFilterOpen ? 'bg-slate-900 text-white border-slate-900' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-700 hover:border-red-900/20'}`}
              >
                <Settings2 size={18} />
                <span>Bộ lọc</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFilterOpen && (
                <div className="absolute top-full mt-3 right-0 w-72 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 z-[80] animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vai trò</label>
                      <select className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold text-sm" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                        <option value="All">Tất cả vai trò</option>
                        {Object.values(MemberRole).map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Trạng thái</label>
                      <select className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="All">Tất cả trạng thái</option>
                        {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <button onClick={() => {setFilterRole('All'); setFilterStatus('All'); setIsFilterOpen(false);}} className="w-full py-3 text-[10px] font-black text-red-900 uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all">Thiết lập lại</button>
                  </div>
                </div>
              )}
           </div>
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-3 shrink-0">
           <div className="flex items-center bg-white/90 dark:bg-slate-900/90 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl backdrop-blur-md">
             <button 
                onClick={exportExcelPro}
                className="px-5 py-3.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl transition-all flex items-center gap-2.5 group border border-emerald-100"
                title="Xuất Excel Chuyên Nghiệp"
             >
                <FileSpreadsheet size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Excel Pro</span>
             </button>
             <div className="w-px h-6 bg-slate-100 dark:bg-slate-700 mx-1"></div>
             <button 
                onClick={handleBatchPrint}
                className="px-5 py-3.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl transition-all flex items-center gap-2.5 group border border-blue-100"
                title="In Loạt Thẻ Thành Viên"
             >
                <Printer size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest">In Loạt Thẻ</span>
             </button>
           </div>

           {/* High-End Add Button */}
           <button 
              onClick={() => handleOpenModal()}
              className="w-16 h-16 burgundy-gradient text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all border border-white/20 relative group overflow-hidden"
              title="Thêm ca viên mới"
            >
              <Plus size={36} strokeWidth={3} />
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
        </div>
      </div>

      {/* List Headers */}
      <div className="px-14 flex items-center text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2 mt-8 opacity-60">
        <div className="w-[30%]">Hồ sơ định danh</div>
        <div className="w-[18%]">Vai trò</div>
        <div className="w-[20%]">Thông tin liên lạc</div>
        <div className="w-[12%] text-center">Trạng thái</div>
        <div className="w-[14%]">Ngày tham gia</div>
        <div className="w-[6%] text-right">Quản trị</div>
      </div>

      {/* Compact List Layout */}
      <div className="space-y-2.5">
        {filteredMembers.map(m => (
          <div key={m.id} className="bg-white dark:bg-slate-900 rounded-2xl p-3 px-10 shadow-sm flex items-center group transition-all hover:shadow-xl border border-transparent hover:border-black/5 hover:-translate-y-0.5 relative overflow-hidden">
            <div className="w-[30%] flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-inner">
                {m.avatar ? <img src={m.avatar} className="w-full h-full object-cover" /> : <Users size={20} className="text-slate-200" />}
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#BC8F44] uppercase tracking-[0.1em] leading-tight mb-1">{m.tenThanh}</span>
                <span className="text-[17px] font-bold text-slate-800 dark:text-white uppercase tracking-tighter leading-none">{m.hoTen}</span>
              </div>
            </div>

            <div className="w-[18%] text-[13px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-slate-100"></div>
              {m.vaiTro}
            </div>

            <div className="w-[20%] flex flex-col gap-0.5">
               <div className="flex items-center gap-2 text-[14px] font-bold text-slate-700 dark:text-slate-300">
                  <Phone size={13} className="text-red-900/40" />
                  {m.soDienThoai || 'Chưa cập nhật'}
               </div>
               <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                  <MapPin size={11} className="text-slate-300" /> {m.queQuan || 'Bắc Hòa'}
               </div>
            </div>

            <div className="w-[12%] flex justify-center">
              <div className={`px-5 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-colors ${
                m.trangThai === Status.Active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
              }`}>
                {m.trangThai === Status.Active ? 'Đang hát' : 'Tạm nghỉ'}
              </div>
            </div>

            <div className="w-[14%] flex flex-col">
               <span className="text-[14px] font-bold text-slate-800 dark:text-white leading-none">{new Date(m.ngayGiaNhap).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
               <span className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-tighter opacity-50">Hệ thống v5.0</span>
            </div>

            {/* Managed Quick Icons */}
            <div className="w-[6%] flex items-center justify-end gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
               <button onClick={() => printMemberCard(m)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="In thẻ riêng"><Printer size={16} /></button>
               <button onClick={() => handleOpenModal(m)} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all" title="Chỉnh sửa"><Edit3 size={16} /></button>
               <button onClick={() => { if(window.confirm('Xóa hồ sơ ca viên?')) { const u = members.filter(x => x.id !== m.id); setMembers(u); saveMembers(u); } }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Xóa"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Tabbed Membership Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-3xl z-[100] flex items-center justify-center p-6">
           <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[3rem] p-10 lg:p-14 flex flex-col lg:flex-row gap-12 shadow-2xl animate-in zoom-in-95 duration-300 relative border border-white/20 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-3 burgundy-gradient"></div>
              
              <div className="lg:w-64 shrink-0 space-y-10">
                 <div className="flex flex-col gap-5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Hình chân dung</label>
                    <div 
                      className="w-full aspect-[4/5] bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden relative flex items-center justify-center group cursor-pointer hover:border-red-900/40 transition-all shadow-inner"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                        {avatarPreview ? (
                          <img src={avatarPreview} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="flex flex-col items-center gap-4 opacity-10">
                             <UserCircle size={60} strokeWidth={1} />
                             <span className="text-[9px] font-bold uppercase tracking-widest text-center">Tải lên ảnh mới</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-red-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-sm"><Camera size={40} /></div>
                        <input ref={avatarInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload = (ev) => setAvatarPreview(ev.target?.result as string); r.readAsDataURL(f); } }} />
                    </div>
                 </div>

                 {/* Tab Navigation */}
                 <nav className="space-y-1.5">
                    {[
                      { id: 'personal', label: 'Thông tin cá nhân', icon: UserCircle },
                      { id: 'contact', label: 'Thông tin liên hệ', icon: Mail },
                      { id: 'role', label: 'Vai trò & Trạng thái', icon: Award }
                    ].map(tab => (
                      <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[12px] font-bold uppercase tracking-widest transition-all ${
                          activeTab === tab.id ? 'bg-[#1E1E1E] text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <tab.icon size={18} /> {tab.label}
                      </button>
                    ))}
                 </nav>
              </div>

              <div className="flex-1 flex flex-col">
                 <div className="flex items-center justify-between mb-10">
                    <div>
                      <h3 className="text-4xl font-bold uppercase dark:text-white tracking-tighter leading-none">Hồ sơ ca viên</h3>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.5em] mt-3">Hệ thống quản lý AngelChoir Cloud v5.0</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-lg"><X size={24} /></button>
                 </div>

                 <form onSubmit={handleSave} className="flex-1 space-y-10 overflow-y-auto pr-6 no-scrollbar max-h-[55vh]">
                    {activeTab === 'personal' && (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-right-4 duration-500">
                          <div className="space-y-3">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-4">Tên Thánh</label>
                            <input type="text" placeholder="Giuse / Maria..." className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-full border-none outline-none text-lg font-bold dark:text-white shadow-inner" value={formData.tenThanh || ''} onChange={e => setFormData({...formData, tenThanh: e.target.value})}/>
                          </div>
                          <div className="space-y-3">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-4">Họ và Tên</label>
                            <input type="text" required placeholder="Họ và tên đầy đủ" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-full border-none outline-none text-lg font-bold dark:text-white shadow-inner" value={formData.hoTen || ''} onChange={e => setFormData({...formData, hoTen: e.target.value})}/>
                          </div>
                          <div className="space-y-3">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-4">Ngày sinh</label>
                            <input type="date" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-full border-none outline-none font-bold text-lg dark:text-white shadow-inner" value={formData.ngaySinh || ''} onChange={e => setFormData({...formData, ngaySinh: e.target.value})}/>
                          </div>
                          <div className="space-y-3">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-4">Giới tính</label>
                            <select className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-full border-none outline-none font-bold text-lg dark:text-white shadow-inner cursor-pointer" value={formData.gioiTinh} onChange={e => setFormData({...formData, gioiTinh: e.target.value as any})}><option value={Gender.Nam}>Nam giới</option><option value={Gender.Nu}>Nữ giới</option></select>
                          </div>
                       </div>
                    )}
                    
                    {activeTab === 'contact' && (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-right-4 duration-500">
                          <div className="space-y-3">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-4">Số điện thoại</label>
                            <input type="tel" placeholder="0xxx xxx xxx" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-full border-none outline-none text-lg font-bold dark:text-white shadow-inner" value={formData.soDienThoai || ''} onChange={e => setFormData({...formData, soDienThoai: e.target.value})}/>
                          </div>
                          <div className="space-y-3">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-4">Quê quán</label>
                            <input type="text" placeholder="Bắc Hòa / Xuân Lộc..." className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-full border-none outline-none text-lg font-bold dark:text-white shadow-inner" value={formData.queQuan || ''} onChange={e => setFormData({...formData, queQuan: e.target.value})}/>
                          </div>
                          <div className="col-span-full space-y-3">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-4">Ghi chú hành vụ</label>
                            <textarea rows={4} placeholder="..." className="w-full px-10 py-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border-none outline-none font-bold text-lg dark:text-white shadow-inner resize-none" value={formData.ghiChu || ''} onChange={e => setFormData({...formData, ghiChu: e.target.value})}></textarea>
                          </div>
                       </div>
                    )}

                    {activeTab === 'role' && (
                       <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                          <div className="grid grid-cols-2 gap-10">
                             <div className="space-y-3">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-4">Vai trò phụng vụ</label>
                                <select className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 rounded-full border-none outline-none text-lg font-bold dark:text-white shadow-inner" value={formData.vaiTro} onChange={e => setFormData({...formData, vaiTro: e.target.value as any})}>
                                   {Object.values(MemberRole).map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                             </div>
                             <div className="space-y-3">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-4">Trạng thái tham gia</label>
                                <select className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 rounded-full border-none outline-none text-lg font-bold dark:text-white shadow-inner" value={formData.trangThai} onChange={e => setFormData({...formData, trangThai: e.target.value as any})}><option value={Status.Active}>Đang hoạt động</option><option value={Status.Inactive}>Tạm nghỉ hát</option></select>
                             </div>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-4">Ngày gia nhập ca đoàn</label>
                             <input type="date" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-full border-none outline-none font-bold text-lg dark:text-white shadow-inner" value={formData.ngayGiaNhap || ''} onChange={e => setFormData({...formData, ngayGiaNhap: e.target.value})}/>
                          </div>
                       </div>
                    )}
                 </form>

                 <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex gap-4 mt-auto">
                    <button 
                      type="submit" 
                      onClick={handleSave} 
                      className="flex-1 py-7 burgundy-gradient text-white rounded-full text-[15px] font-bold uppercase tracking-[0.4em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-6"
                    >
                       <Check size={28} strokeWidth={4} /> XÁC NHẬN LƯU TRỮ
                    </button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-12 py-7 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-slate-200 transition-all">ĐÓNG</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Redesigned Premium Vertical ID Card Print Template */}
      <div className="fixed -left-[20000px] top-0 pointer-events-none font-times">
        {filteredMembers.map(m => (
          <div key={m.id} id={`print-template-${m.id}`} className="w-[540px] h-[860px] bg-white relative flex flex-col overflow-hidden" style={{ border: '2px solid #E2E8F0' }}>
            {/* Top Branding Section */}
            <div className="h-[400px] burgundy-gradient relative flex flex-col items-center pt-12 overflow-hidden">
              {/* Background Accent Graphics */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute top-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-3xl"></div>
              
              {/* Header Text */}
              <div className="text-[30px] font-black text-white/95 tracking-[0.5em] mb-2 uppercase drop-shadow-md">ANGELCHOIR</div>
              <div className="text-[12px] font-bold text-[#D4AF37] tracking-[0.3em] uppercase opacity-80 mb-10">BẮC HÒA - XUÂN LỘC</div>
              
              {/* Profile Photo Frame */}
              <div className="w-[320px] h-[380px] rounded-[4.5rem] bg-white p-3 shadow-2xl z-10 border-[10px] border-[#D4AF37] relative">
                <div className="w-full h-full rounded-[3.5rem] overflow-hidden bg-slate-50 flex items-center justify-center">
                  {m.avatar ? (
                    <img src={m.avatar} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-200">
                      <Users size={160} strokeWidth={1} />
                      <span className="text-[12px] font-bold uppercase tracking-widest mt-4">Profile Image</span>
                    </div>
                  )}
                </div>
                {/* Status Indicator on Frame */}
                <div className={`absolute -right-2 top-10 px-6 py-2 rounded-full border-4 border-white text-white text-[12px] font-black uppercase tracking-widest shadow-xl ${m.trangThai === Status.Active ? 'bg-emerald-500' : 'bg-red-500'}`}>
                   {m.trangThai === Status.Active ? 'ACTIVE' : 'AWAY'}
                </div>
              </div>
              
              {/* Role Badge - Floating Overlay */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-14 py-6 bg-white text-[#7F1D1D] rounded-[2rem] text-[22px] font-black uppercase tracking-[0.1em] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border-[8px] border-[#D4AF37] z-20 whitespace-nowrap min-w-[280px] text-center">
                {m.vaiTro.toUpperCase()}
              </div>
            </div>

            {/* Member Information Section */}
            <div className="flex-1 pt-32 pb-16 px-16 flex flex-col items-center text-center">
              <div className="mb-14 space-y-3">
                <span className="text-[34px] font-black text-[#BC8F44] uppercase tracking-[0.4em] block leading-none drop-shadow-sm">{m.tenThanh}</span>
                <h2 className="text-[56px] font-black text-[#0F172A] uppercase leading-none tracking-tighter">{m.hoTen}</h2>
                <div className="w-[60px] h-1.5 bg-[#D4AF37] mx-auto mt-6 rounded-full opacity-60"></div>
              </div>

              {/* Contact Details */}
              <div className="flex flex-col gap-6 mb-20 w-full px-8">
                <div className="flex items-center justify-center gap-6 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                  <div className="w-12 h-12 rounded-full bg-red-900/10 flex items-center justify-center text-red-900">
                    <Phone size={24} />
                  </div>
                  <span className="text-[28px] font-black text-slate-800 tracking-wide font-times">{m.soDienThoai || 'CHƯA CẬP NHẬT'}</span>
                </div>
                
                <div className="flex items-center justify-center gap-4 py-2 opacity-50">
                  <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                  <span className="text-[14px] font-black uppercase tracking-[0.3em] text-slate-400">OFFICIAL MEMBER ID CARD</span>
                  <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                </div>
              </div>

              {/* Security & ID Verification Section */}
              <div className="w-full mt-auto p-12 bg-slate-900 rounded-[5rem] border-4 border-[#D4AF37] flex items-center justify-between shadow-2xl relative overflow-hidden group">
                {/* Geometric Accent */}
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
                
                <div className="text-left relative z-10 flex flex-col justify-center">
                  <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-4 opacity-70">DIGITAL IDENTITY</p>
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-[#D4AF37] border border-white/10">
                      <Fingerprint size={32} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[38px] font-black text-white font-mono tracking-tighter leading-none">BH-{String(m.id).slice(-6)}</span>
                      <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest mt-1">Verified Member</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white rounded-[2.5rem] border-[6px] border-[#D4AF37] shadow-2xl relative z-10">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BH-MEMBER-${m.id}`} className="w-24 h-24" alt="QR" />
                </div>
              </div>
            </div>

            {/* Bottom Accent Bar */}
            <div className="h-6 bg-[#D4AF37] w-full mt-auto flex">
              <div className="h-full w-1/3 burgundy-gradient opacity-80"></div>
              <div className="h-full w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Global Printing Overlay */}
      {isPrinting && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-3xl z-[200] flex flex-col items-center justify-center text-white gap-8 font-times">
           <div className="relative">
              <Loader2 size={100} className="animate-spin text-[#D4AF37]" />
              <Printer size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
           </div>
           <p className="text-3xl font-bold uppercase tracking-[0.4em] animate-pulse">Đang trích xuất thẻ định danh...</p>
        </div>
      )}
    </div>
  );
};

export default Members;
