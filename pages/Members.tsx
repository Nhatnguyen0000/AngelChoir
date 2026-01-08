
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Trash2, X, Edit3, Search, 
  Users, Printer, 
  Save, Award, Phone, Upload, 
  Fingerprint, Mail, UserCircle,
  FileDown, FileUp, CheckCircle2,
  Calendar, MapPin, ShieldCheck, Info,
  MoreHorizontal
} from 'lucide-react';
import { getMembers, saveMembers, getSpringColor } from '../store';
import { ThanhVien, MemberRole, Status, Gender } from '../types';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const Members: React.FC = () => {
  const [members, setMembers] = useState<ThanhVien[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ThanhVien | null>(null);
  const [formData, setFormData] = useState<Partial<ThanhVien>>({});
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'contact' | 'role'>('personal');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const springColor = getSpringColor();
  const currentTheme = localStorage.getItem('theme') || 'light';
  const isSpring = currentTheme === 'spring';

  useEffect(() => {
    setMembers(getMembers());
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const text = (m.tenThanh + " " + m.hoTen).toLowerCase();
      return text.includes(searchTerm.toLowerCase());
    }).sort((a, b) => a.hoTen.localeCompare(b.hoTen));
  }, [members, searchTerm]);

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
        queQuan: '',
        soDienThoai: ''
      });
      setAvatarPreview('');
    }
    setActiveTab('personal');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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

  const exportExcel = () => {
    const excelData = filteredMembers.map((m, index) => ({
      'STT': index + 1,
      'Tên Thánh': m.tenThanh,
      'Họ và Tên': m.hoTen,
      'Ngày Sinh': m.ngaySinh,
      'Giới tính': m.gioiTinh,
      'Quê quán': m.queQuan || '',
      'Vai trò': m.vaiTro,
      'Số điện thoại': m.soDienThoai || '',
      'Ngày tham gia': m.ngayGiaNhap,
      'Trạng thái': m.trangThai,
      'Ghi chú': m.ghiChu || ''
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // EPPlus-like styling for column widths
    const wscols = [
      {wch: 6}, {wch: 15}, {wch: 25}, {wch: 15}, {wch: 10}, 
      {wch: 25}, {wch: 20}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 35}
    ];
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh Sách Ca Viên");
    XLSX.writeFile(wb, `AngelChoir_Members_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const imported: ThanhVien[] = (data as any[]).map((row) => ({
          id: Date.now() + Math.random(),
          tenThanh: row['Tên Thánh'] || '',
          hoTen: row['Họ và Tên'] || '',
          ngaySinh: row['Ngày Sinh'] || '',
          gioiTinh: row['Giới tính'] || Gender.Nam,
          queQuan: row['Quê quán'] || '',
          vaiTro: row['Vai trò'] || MemberRole.CaVien,
          soDienThoai: row['Số điện thoại'] || '',
          ngayGiaNhap: row['Ngày tham gia'] || new Date().toISOString().split('T')[0],
          trangThai: row['Trạng thái'] || Status.Active,
          ghiChu: row['Ghi chú'] || '',
          points: 0
        }));

        const updated = [...members, ...imported];
        setMembers(updated);
        saveMembers(updated);
        alert(`Đã nhập thành công ${imported.length} ca viên.`);
      } catch (err) {
        alert("Lỗi nhập dữ liệu. Vui lòng kiểm tra lại định dạng tệp Excel mẫu.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const printSingleCard = async (m: ThanhVien) => {
    const element = document.getElementById(`print-template-${m.id}`);
    if (!element) return;
    setIsPrinting(true);
    const canvas = await html2canvas(element, { scale: 3, useCORS: true, backgroundColor: null });
    const imgData = canvas.toDataURL('image/png');
    // Card size in mm: 54x86 (standard CR80)
    const pdf = new jsPDF('p', 'mm', [54, 86]); 
    pdf.addImage(imgData, 'PNG', 0, 0, 54, 86);
    pdf.save(`THE_ID_${m.hoTen.toUpperCase().replace(/\s/g, '_')}.pdf`);
    setIsPrinting(false);
  };

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto px-4 pb-32 animate-in fade-in duration-500">
      
      {/* Search & Tool Row */}
      <div className="glass rounded-[2rem] p-3 flex flex-col md:flex-row items-center gap-4 shadow-lg border border-white/40 dark:border-slate-800/40">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm ca viên nhanh..."
            className="w-full pl-14 pr-8 py-3 bg-white/40 dark:bg-slate-900/40 rounded-full border-none outline-none text-sm font-bold shadow-inner placeholder:text-slate-400"
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Main Add Button - Primary Action */}
          <button 
            onClick={() => handleOpenModal()}
            style={{ backgroundColor: springColor }}
            className="w-11 h-11 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all group relative"
            title="Thêm ca viên mới"
          >
            <Plus size={24} strokeWidth={3} />
          </button>

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-1"></div>

          {/* Grouped Tool Icons */}
          <div className="flex items-center gap-1.5 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-full">
            <button onClick={exportExcel} className="p-2.5 text-emerald-600 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-all shadow-sm" title="Xuất Excel Ca Viên">
              <FileDown size={18} />
            </button>
            <label className="p-2.5 text-blue-600 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-all shadow-sm cursor-pointer" title="Nhập Excel">
              <FileUp size={18} />
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleImportExcel} />
            </label>
            <button onClick={() => alert('Chọn ca viên để in thẻ định danh bên dưới.')} className="p-2.5 text-slate-500 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-all shadow-sm" title="In thẻ định danh">
              <Printer size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="glass rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-slate-800/50 overflow-hidden flex flex-col min-h-[500px]">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 border-b border-black/5">
              <tr>
                <th className="py-4 px-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">Hồ sơ ca viên</th>
                <th className="py-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Liên hệ</th>
                <th className="py-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">Vai trò</th>
                <th className="py-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell text-center">Trạng thái</th>
                <th className="py-4 px-8 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredMembers.map(m => (
                <tr key={m.id} className="group hover:bg-white/50 dark:hover:bg-slate-800/40 transition-all duration-300">
                  <td className="py-3 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-black/5 overflow-hidden shadow-sm shrink-0">
                        {m.avatar ? <img src={m.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Users size={18} /></div>}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-[#BC8F44] uppercase tracking-widest leading-none mb-1">{m.tenThanh}</span>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{m.hoTen}</h3>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 text-slate-500"><Phone size={10} className="opacity-40" /><span className="text-[10px] font-bold">{m.soDienThoai || '---'}</span></div>
                      <div className="flex items-center gap-2 text-slate-400"><MapPin size={10} className="opacity-40" /><span className="text-[9px] truncate max-w-[150px]">{m.queQuan || '---'}</span></div>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-100/50 dark:bg-slate-800/50 px-3 py-1 rounded-full border border-black/5">{m.vaiTro}</span>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell text-center">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase border ${m.trangThai === Status.Active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                      <div className={`w-1 h-1 rounded-full ${m.trangThai === Status.Active ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      {m.trangThai}
                    </div>
                  </td>
                  <td className="py-3 px-8 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => printSingleCard(m)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="In thẻ ID"><Printer size={16} /></button>
                      <button onClick={() => handleOpenModal(m)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all" title="Chỉnh sửa"><Edit3 size={16} /></button>
                      <button onClick={() => { if(window.confirm('Xóa ca viên khỏi hệ thống?')) { const u = members.filter(x => x.id !== m.id); setMembers(u); saveMembers(u); } }} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Xóa"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMembers.length === 0 && (
            <div className="py-32 flex flex-col items-center justify-center text-center opacity-30">
              <Users size={60} strokeWidth={1} className="mb-4" />
              <p className="text-sm font-black uppercase tracking-[0.2em]">Không tìm thấy ca viên nào</p>
            </div>
          )}
        </div>
        <div className="mt-auto p-4 border-t border-black/5 bg-slate-50/20 flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
           <span>AngelChoir Member Portal v2.0</span>
           <span>Tổng số: {filteredMembers.length} ca viên</span>
        </div>
      </div>

      {/* ID Card Template for Printing (Standard CR80 Ratio 86x54mm) */}
      <div className="fixed -left-[10000px] top-0 pointer-events-none">
        {filteredMembers.map(m => (
          <div 
            key={m.id} 
            id={`print-template-${m.id}`} 
            className="w-[315px] h-[500px] bg-white relative overflow-hidden flex flex-col font-serif"
          >
            {/* Header Navy Block */}
            <div className="h-[260px] bg-[#001f3f] relative flex flex-col items-center pt-10">
              <div className="text-[14px] font-black text-white/80 tracking-[0.6em] mb-8 uppercase font-serif">ANGELCHOIR</div>
              
              <div className="w-[160px] h-[190px] rounded-[3.5rem] bg-[#1e293b] border-[3px] border-[#D4AF37] overflow-hidden relative shadow-2xl z-10">
                {m.avatar ? <img src={m.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-800"><Users size={70} className="text-white/5" /></div>}
              </div>

              <div className="absolute bottom-[-18px] z-20 px-8 py-2.5 bg-[#D4AF37] text-white rounded-xl text-[11px] font-black uppercase tracking-[0.15em] shadow-xl border border-white/20 font-sans">
                {m.vaiTro.toUpperCase()}
              </div>
            </div>

            {/* Information Section */}
            <div className="flex-1 pt-14 flex flex-col items-center px-8 text-center bg-white">
              <span className="text-[16px] font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-1 font-serif">{m.tenThanh}</span>
              <h2 className="text-[22px] font-black text-[#001f3f] uppercase leading-tight tracking-tight mb-8 font-serif px-2">{m.hoTen}</h2>
              
              <div className="w-full h-[1px] bg-slate-100 mb-8"></div>

              <div className="flex flex-col gap-2 items-center mb-8 font-sans">
                 <div className="flex items-center gap-2 text-[#001f3f]">
                    <Phone size={12} className="opacity-50" />
                    <span className="text-[12px] font-bold">{m.soDienThoai || 'N/A'}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${m.trangThai === Status.Active ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{m.trangThai}</span>
                 </div>
              </div>

              {/* ID & QR Section */}
              <div className="w-full flex items-center justify-between mt-auto mb-10 bg-slate-50/50 p-4 rounded-2xl border border-black/5">
                <div className="text-left">
                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 font-sans">ID ĐỊNH DANH</p>
                  <div className="flex items-center gap-1.5">
                    <Fingerprint size={14} className="text-slate-400" />
                    <span className="text-[14px] font-black text-[#001f3f] font-mono tracking-tighter">BH-{String(m.id).slice(-6)}</span>
                  </div>
                </div>
                <div className="p-1 bg-white border border-slate-100 rounded-lg shadow-sm">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=BH-MEMBER-${m.id}`} className="w-12 h-12" alt="QR" />
                </div>
              </div>
            </div>
            <div className="h-3 bg-[#D4AF37] w-full mt-auto"></div>
          </div>
        ))}
      </div>

      {/* Tabbed Member Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3.5rem] p-10 flex flex-col lg:flex-row gap-10 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: springColor }}></div>
              
              {/* Sidebar Navigation */}
              <div className="lg:w-60 shrink-0 space-y-8">
                 <div 
                   className="w-full aspect-[3/4] bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden relative flex items-center justify-center group cursor-pointer"
                   onClick={() => avatarInputRef.current?.click()}
                 >
                    {avatarPreview ? <img src={avatarPreview} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center gap-2 opacity-20"><Users size={40} /><span className="text-[8px] font-black uppercase">Tải ảnh lên</span></div>}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><Upload size={20} /></div>
                    <input ref={avatarInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload = (ev) => setAvatarPreview(ev.target?.result as string); r.readAsDataURL(f); } }} />
                 </div>

                 <div className="space-y-1.5">
                    {[
                      { id: 'personal', label: 'Cá nhân', icon: UserCircle },
                      { id: 'contact', label: 'Liên hệ', icon: Mail },
                      { id: 'role', label: 'Vai trò & Trạng thái', icon: Award }
                    ].map(tab => (
                      <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        <tab.icon size={16} /> {tab.label}
                      </button>
                    ))}
                 </div>
              </div>

              {/* Form Content Area */}
              <div className="flex-1 flex flex-col">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                       <h3 className="text-2xl font-black uppercase tracking-tighter dark:text-white leading-none">Hồ sơ ca viên</h3>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 tracking-[0.2em]">Hệ thống quản lý AngelChoir v2.0</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"><X size={20} /></button>
                 </div>

                 <form onSubmit={handleSave} className="flex-1 space-y-8 overflow-y-auto pr-2 no-scrollbar max-h-[50vh]">
                    {activeTab === 'personal' && (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Tên Thánh</label>
                             <input type="text" required placeholder="Vd: Maria" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] border-none font-bold text-sm" value={formData.tenThanh || ''} onChange={e => setFormData({...formData, tenThanh: e.target.value})}/>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Họ và Tên</label>
                             <input type="text" required placeholder="Họ và tên đầy đủ" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] border-none font-bold text-sm" value={formData.hoTen || ''} onChange={e => setFormData({...formData, hoTen: e.target.value})}/>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Ngày sinh</label>
                             <input type="date" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] border-none font-bold text-sm" value={formData.ngaySinh || ''} onChange={e => setFormData({...formData, ngaySinh: e.target.value})}/>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Giới tính</label>
                             <div className="flex gap-3">
                                {[Gender.Nam, Gender.Nu].map(g => (
                                   <button key={g} type="button" onClick={() => setFormData({...formData, gioiTinh: g})} className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase border-2 transition-all ${formData.gioiTinh === g ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-transparent hover:border-slate-200'}`}>{g}</button>
                                ))}
                             </div>
                          </div>
                       </div>
                    )}

                    {activeTab === 'contact' && (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Số điện thoại</label>
                             <input type="tel" placeholder="0xxx-xxx-xxx" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] border-none font-bold text-sm" value={formData.soDienThoai || ''} onChange={e => setFormData({...formData, soDienThoai: e.target.value})}/>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Quê quán / Địa chỉ</label>
                             <input type="text" placeholder="Địa chỉ thường trú" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] border-none font-bold text-sm" value={formData.queQuan || ''} onChange={e => setFormData({...formData, queQuan: e.target.value})}/>
                          </div>
                       </div>
                    )}

                    {activeTab === 'role' && (
                       <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                          <div className="space-y-3">
                             <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Vai trò phụng sự</label>
                             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {Object.values(MemberRole).map(role => (
                                   <button key={role} type="button" onClick={() => setFormData({...formData, vaiTro: role})} className={`py-3 rounded-xl text-[8px] font-black uppercase border-2 transition-all ${formData.vaiTro === role ? 'bg-[#BC8F44] text-white border-[#BC8F44]' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-transparent hover:border-slate-200'}`}>{role}</button>
                                ))}
                             </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Trạng thái hoạt động</label>
                                <select className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] border-none font-bold text-sm cursor-pointer shadow-inner" value={formData.trangThai} onChange={e => setFormData({...formData, trangThai: e.target.value as any})}>
                                   <option value={Status.Active}>ĐANG HOẠT ĐỘNG</option>
                                   <option value={Status.Inactive}>TẠM NGHỈ</option>
                                </select>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Ngày gia nhập</label>
                                <input type="date" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] border-none font-bold text-sm" value={formData.ngayGiaNhap || ''} onChange={e => setFormData({...formData, ngayGiaNhap: e.target.value})}/>
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Ghi chú thêm</label>
                             <textarea rows={2} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border-none font-bold text-sm resize-none" value={formData.ghiChu || ''} onChange={e => setFormData({...formData, ghiChu: e.target.value})}></textarea>
                          </div>
                       </div>
                    )}
                 </form>

                 <div className="pt-8 border-t flex gap-4 mt-auto">
                    <button type="submit" onClick={handleSave} style={{ backgroundColor: springColor }} className="flex-1 py-5 text-white rounded-full text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-3 active:scale-95">
                       <CheckCircle2 size={20} /> HOÀN TẤT LƯU TRỮ
                    </button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Đóng</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Members;
