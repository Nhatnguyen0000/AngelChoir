
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Trash2, X, Edit3, Download, Upload,
  Search, Filter, Cake, Gift,
  Phone, Calendar, UserCheck, Users,
  Heart, MapPin, UserPlus, Info, ShieldCheck, Contact2, Fingerprint,
  StickyNote, Camera
} from 'lucide-react';
import { getMembers, saveMembers, getSpringColor } from '../store';
import { ThanhVien, MemberRole, Status, Gender } from '../types';
import * as XLSX from 'xlsx';

const Members: React.FC = () => {
  const [members, setMembers] = useState<ThanhVien[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ThanhVien | null>(null);
  const [formData, setFormData] = useState<Partial<ThanhVien>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('Tất cả');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTheme = localStorage.getItem('theme') || 'light';
  const isSpring = currentTheme === 'spring';
  const springColor = getSpringColor();

  useEffect(() => {
    setMembers(getMembers());
  }, []);

  const birthdayMembers = useMemo(() => {
    const today = new Date();
    const mmdd = `${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    return members.filter(m => m.ngaySinh && m.ngaySinh.endsWith(mmdd));
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchSearch = (m.hoTen + m.tenThanh + m.soDienThoai).toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = filterRole === 'Tất cả' || m.vaiTro === filterRole;
      return matchSearch && matchRole;
    }).sort((a, b) => a.hoTen.localeCompare(b.hoTen));
  }, [members, searchTerm, filterRole]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedMembers: ThanhVien[];
    if (editingMember) {
      updatedMembers = members.map(m => m.id === editingMember.id ? { ...m, ...formData } as ThanhVien : m);
    } else {
      const newMember: ThanhVien = {
        ...formData as ThanhVien,
        id: Date.now(),
        ngayGiaNhap: formData.ngayGiaNhap || new Date().toISOString().split('T')[0],
        points: 0,
        skills: { range: 5, technique: 5, musicTheory: 5, sightReading: 5 },
        ghiChu: formData.ghiChu || '',
        queQuan: formData.queQuan || ''
      };
      updatedMembers = [...members, newMember];
    }
    setMembers(updatedMembers);
    saveMembers(updatedMembers);
    setIsModalOpen(false);
  };

  const handleExportXlsx = () => {
    try {
      const dataToExport = filteredMembers.map((m, index) => ({
        'STT': index + 1,
        'Tên Thánh': m.tenThanh,
        'Họ và Tên': m.hoTen,
        'Giới tính': m.gioiTinh,
        'Vai trò': m.vaiTro,
        'Số điện thoại': m.soDienThoai || 'N/A',
        'Ngày sinh': m.ngaySinh || 'N/A',
        'Ngày gia nhập': m.ngayGiaNhap,
        'Trạng thái': m.trangThai,
        'Ghi chú': m.ghiChu || ''
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      ws['!cols'] = [{ wch: 6 }, { wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 35 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "DANH SÁCH CA VIÊN");
      XLSX.writeFile(wb, `AngelChoir_Members_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      alert('Lỗi xuất Excel. Vui lòng thử lại.');
    }
  };

  const handleImportXlsx = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        const importedMembers: ThanhVien[] = data.map((item: any, index: number) => ({
          id: Date.now() + index,
          tenThanh: item['Tên Thánh'] || item['TÊN THÁNH'] || '',
          hoTen: item['Họ và Tên'] || item['HỌ VÀ TÊN'] || 'Chưa rõ tên',
          ngaySinh: item['Ngày sinh'] || item['NGÀY SINH'] || '',
          gioiTinh: (item['Giới tính'] || item['GIỚI TÍNH'] || Gender.Nam) as Gender,
          vaiTro: (item['Vai trò'] || item['VAI TRÒ'] || MemberRole.CaVien) as MemberRole,
          soDienThoai: (item['Số điện thoại'] || item['SỐ ĐIỆN THOẠI'] || '').toString(),
          ngayGiaNhap: item['Ngày gia nhập'] || item['NGÀY GIA NHẬP'] || new Date().toISOString().split('T')[0],
          trangThai: (item['Trạng thái'] || item['TRẠNG THÁI'] || Status.Active) as Status,
          ghiChu: item['Ghi chú'] || item['GHI CHÚ'] || '',
          points: 0,
          queQuan: '',
          skills: { range: 5, technique: 5, musicTheory: 5, sightReading: 5 }
        }));
        const newMemberList = [...members, ...importedMembers];
        setMembers(newMemberList);
        saveMembers(newMemberList);
        alert(`Nhập thành công ${importedMembers.length} ca viên mới!`);
      } catch (error) {
        alert('Lỗi định dạng file!');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Optimized Input Classes: Bold Borders, readable text, clear focus state
  const inputClasses = "w-full px-5 py-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-300 dark:border-slate-700 outline-none font-bold text-sm text-slate-800 dark:text-white shadow-sm focus:border-slate-800 dark:focus:border-slate-200 focus:ring-4 focus:ring-slate-200 dark:focus:ring-slate-800/50 transition-all placeholder:text-slate-300";
  const labelClasses = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block";

  return (
    <div className="space-y-8 pb-32 max-w-[1600px] mx-auto animate-in fade-in duration-700 px-4">
      
      {birthdayMembers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
           {birthdayMembers.map(m => (
             <div key={m.id} className="bg-gradient-to-br from-[#BC8F44] to-[#8B6E31] p-6 rounded-[2.5rem] shadow-2xl text-white flex items-center gap-6 relative overflow-hidden animate-bounce-subtle hover:scale-[1.03] transition-all cursor-default">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-xl border border-white/20 shrink-0">
                  <Cake size={32} />
                </div>
                <div className="flex-1">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Mừng tuổi mới ca viên</p>
                   <h4 className="text-xl font-black uppercase tracking-tight leading-none">{m.tenThanh} {m.hoTen}</h4>
                </div>
                <Gift className="absolute -right-6 -bottom-6 opacity-10 rotate-12 scale-150" size={120} />
             </div>
           ))}
        </div>
      )}

      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5 border border-white dark:border-slate-800">
        <div className="flex-1 flex items-center gap-4 w-full">
          <div className="relative group w-full max-w-sm">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#BC8F44] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Tìm theo tên hoặc số điện thoại..."
              className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none text-sm font-bold text-slate-600 dark:text-white shadow-inner focus:ring-2 focus:ring-[#BC8F44]/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="hidden lg:flex items-center gap-3 px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-black/5">
             <Filter size={14} className="text-slate-400" />
             <select 
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-transparent text-[10px] font-black text-slate-500 uppercase outline-none tracking-widest cursor-pointer"
             >
                <option value="Tất cả">TẤT CẢ VAI TRÒ</option>
                {Object.values(MemberRole).map(role => <option key={role} value={role}>{role}</option>)}
             </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shadow-inner border border-black/5">
              <button onClick={handleExportXlsx} className="p-3.5 text-emerald-600 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm hover:shadow-md" title="Xuất file Excel báo cáo">
                <Download size={20} />
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="p-3.5 text-blue-600 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm hover:shadow-md" title="Nhập danh sách từ Excel">
                <Upload size={20} />
              </button>
           </div>
           <input ref={fileInputRef} type="file" className="hidden" accept=".xlsx, .xls" onChange={handleImportXlsx} />
           
           <button 
              onClick={() => { setEditingMember(null); setFormData({ trangThai: Status.Active, gioiTinh: Gender.Nam, vaiTro: MemberRole.CaVien, ngayGiaNhap: new Date().toISOString().split('T')[0] }); setIsModalOpen(true); }}
              style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }}
              className="w-14 h-14 text-white rounded-[1.5rem] shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center border border-white/20 group"
           >
              <UserPlus size={28} className="group-hover:rotate-12 transition-transform" />
           </button>
        </div>
      </div>

      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[3rem] shadow-2xl border border-white dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="py-7 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest w-12 text-center">STT</th>
                <th className="py-7 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">HỒ SƠ CA VIÊN</th>
                <th className="py-7 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">NGÀY SINH</th>
                <th className="py-7 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">LIÊN HỆ</th>
                <th className="py-7 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">GIA NHẬP</th>
                <th className="py-7 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">TRẠNG THÁI</th>
                <th className="py-7 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMembers.map((m, idx) => (
                <tr key={m.id} className="group hover:bg-white dark:hover:bg-slate-800/60 transition-all duration-300 transform hover:scale-[1.01] origin-center">
                  <td className="py-6 px-8 text-[11px] font-black text-slate-300 text-center">{idx + 1}</td>
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-4">
                      <div 
                        style={{ backgroundColor: isSpring ? springColor + '15' : '#BC8F4415', color: isSpring ? springColor : '#BC8F44' }} 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs border border-black/5 shadow-inner shrink-0"
                      >
                        {getInitials(m.hoTen)}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[11px] font-black uppercase tracking-tighter mb-0.5 ${isSpring ? 'text-slate-800' : 'text-[#BC8F44]'}`}>
                          {m.tenThanh}
                        </span>
                        <span className="text-sm font-bold text-slate-800 dark:text-white leading-none">
                          {m.hoTen}
                        </span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-60">
                          {m.vaiTro}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Calendar size={14} className="opacity-40" /> {m.ngaySinh || '---'}
                    </div>
                  </td>
                  <td className="py-6 px-6 hidden md:table-cell">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Phone size={14} className="opacity-40" /> {m.soDienThoai || '---'}
                    </div>
                  </td>
                  <td className="py-6 px-6 hidden lg:table-cell text-xs font-bold text-slate-400">
                    {m.ngayGiaNhap}
                  </td>
                  <td className="py-6 px-6 text-center">
                    <span className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      m.trangThai === Status.Active 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}>
                      {m.trangThai === Status.Active ? 'Đang hát' : 'Tạm nghỉ'}
                    </span>
                  </td>
                  <td className="py-6 px-8 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                       <button 
                         onClick={() => { setEditingMember(m); setFormData(m); setIsModalOpen(true); }} 
                         className="p-3 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all shadow-sm"
                        >
                         <Edit3 size={18} />
                       </button>
                       <button 
                         onClick={() => { if(window.confirm(`Xóa hồ sơ ca viên ${m.hoTen}?`)) { const u = members.filter(x => x.id !== m.id); setMembers(u); saveMembers(u); } }} 
                         className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all shadow-sm"
                        >
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMembers.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center opacity-30 text-center space-y-4">
              <Users size={80} strokeWidth={1} />
              <p className="text-sm font-black uppercase tracking-[0.5em]">Không tìm thấy ca viên phù hợp</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-3xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-500">
           <div className="bg-white dark:bg-slate-950 w-full max-w-4xl rounded-[4rem] shadow-2xl relative border border-white/20 p-8 lg:p-10 animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[95vh] no-scrollbar">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-3xl hover:bg-red-500 hover:text-white transition-all shadow-lg z-10"><X size={24} /></button>
              
              <div className="flex items-center gap-5 mb-8">
                 <div style={{ backgroundColor: isSpring ? springColor : '#0F172A' }} className="w-16 h-16 rounded-[1.8rem] flex items-center justify-center text-white shadow-xl shrink-0">
                    <Fingerprint size={32} />
                 </div>
                 <div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter dark:text-white leading-none">
                     {editingMember ? 'Cập Nhật Hồ Sơ' : 'Thêm Thành Viên'}
                   </h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Hệ Thống Quản Lý Ca Đoàn</p>
                 </div>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                 
                 {/* 1. PERSONAL INFO - Full Width Top Section */}
                 <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                       <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-[#BC8F44] shadow-sm">
                          <Contact2 size={16} />
                       </div>
                       <h4 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">Thông tin cá nhân</h4>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-8">
                       {/* Avatar Placeholder */}
                       <div className="shrink-0 flex flex-col items-center gap-2">
                          <div className="w-24 h-32 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-300">
                             <Camera size={32} />
                          </div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Ảnh thẻ</span>
                       </div>

                       {/* Inputs */}
                       <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                             <label className={labelClasses}>Tên Thánh</label>
                             <input type="text" value={formData.tenThanh || ''} className={inputClasses} onChange={e => setFormData({...formData, tenThanh: e.target.value})}/>
                          </div>
                          <div>
                             <label className={labelClasses}>Họ và Tên</label>
                             <input type="text" required value={formData.hoTen || ''} className={inputClasses} onChange={e => setFormData({...formData, hoTen: e.target.value})}/>
                          </div>
                          <div>
                             <label className={labelClasses}>Ngày sinh</label>
                             <input type="date" value={formData.ngaySinh || ''} className={inputClasses} onChange={e => setFormData({...formData, ngaySinh: e.target.value})}/>
                          </div>
                          <div>
                             <label className={labelClasses}>Giới tính</label>
                             <div className="flex bg-white dark:bg-slate-950 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                {Object.values(Gender).map(g => (
                                  <button key={g} type="button" onClick={() => setFormData({...formData, gioiTinh: g})} className={`flex-1 py-2.5 rounded-[0.6rem] text-[10px] font-black uppercase tracking-widest transition-all ${formData.gioiTinh === g ? 'bg-slate-100 dark:bg-slate-800 shadow-inner text-[#BC8F44]' : 'text-slate-400'}`}>{g}</button>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* 2 & 3. Bottom Columns */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Contact Info */}
                    <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col">
                       <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-blue-500 shadow-sm">
                             <Phone size={16} />
                          </div>
                          <h4 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">Thông tin liên hệ</h4>
                       </div>
                       <div className="space-y-5 flex-1">
                          <div>
                             <label className={labelClasses}>Số điện thoại</label>
                             <input type="tel" value={formData.soDienThoai || ''} className={inputClasses} onChange={e => setFormData({...formData, soDienThoai: e.target.value})}/>
                          </div>
                          <div>
                             <label className={labelClasses}>Quê quán / Địa chỉ</label>
                             <textarea rows={3} value={formData.queQuan || ''} className={`${inputClasses} resize-none`} onChange={e => setFormData({...formData, queQuan: e.target.value})}></textarea>
                          </div>
                       </div>
                    </div>

                    {/* Role & Status */}
                    <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                       <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-emerald-500 shadow-sm">
                             <ShieldCheck size={16} />
                          </div>
                          <h4 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">Vai trò & Trạng thái</h4>
                       </div>
                       <div className="space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className={labelClasses}>Vai trò</label>
                                <select className={`${inputClasses} cursor-pointer appearance-none`} value={formData.vaiTro} onChange={e => setFormData({...formData, vaiTro: e.target.value as MemberRole})}>
                                   {Object.values(MemberRole).map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                             </div>
                             <div>
                                <label className={labelClasses}>Trạng thái</label>
                                <select className={`${inputClasses} cursor-pointer appearance-none`} value={formData.trangThai} onChange={e => setFormData({...formData, trangThai: e.target.value as Status})}>
                                   {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                             </div>
                          </div>
                          <div>
                             <label className={labelClasses}>Ngày gia nhập</label>
                             <input type="date" value={formData.ngayGiaNhap || ''} className={inputClasses} onChange={e => setFormData({...formData, ngayGiaNhap: e.target.value})}/>
                          </div>
                          <div>
                             <div className="flex items-center gap-2 mb-1.5">
                                <StickyNote size={12} className="text-slate-400"/>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ghi chú</label>
                             </div>
                             <input type="text" value={formData.ghiChu || ''} className={inputClasses} placeholder="..." onChange={e => setFormData({...formData, ghiChu: e.target.value})} />
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button type="submit" style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }} className="flex-1 py-5 text-white rounded-2xl text-[12px] font-black tracking-[0.3em] uppercase shadow-2xl hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]">LƯU THÔNG TIN</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-slate-200 transition-all">HỦY BỎ</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Members;
