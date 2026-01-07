
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  X, 
  Edit3, 
  Download, 
  PieChart as PieChartIcon,
  Search,
  Phone,
  Filter,
  ChevronDown,
  Info,
  Contact,
  Briefcase,
  CheckCircle2,
  MapPin,
  Printer,
  Upload,
  User as UserIcon,
  UserCircle,
  FileText,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';
import { getMembers, saveMembers, getSpringColor } from '../store';
import { ThanhVien, MemberRole, Gender, Status } from '../types';

const Members: React.FC = () => {
  const [members, setMembers] = useState<ThanhVien[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ThanhVien | null>(null);
  const [formData, setFormData] = useState<Partial<ThanhVien>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('Tất cả');

  const currentTheme = localStorage.getItem('theme') || 'light';
  const isSpring = currentTheme === 'spring';
  const springColor = getSpringColor();

  useEffect(() => {
    setMembers(getMembers());
  }, []);

  const analysis = useMemo(() => {
    const total = members.length;
    if (total === 0) return null;
    const male = members.filter(m => m.gioiTinh === Gender.Nam).length;
    const female = members.filter(m => m.gioiTinh === Gender.Nu).length;
    const roleStats = Object.values(MemberRole).map(role => {
      const count = members.filter(m => m.vaiTro === role).length;
      return { role, count };
    });
    return { total, male, female, roleStats };
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchSearch = m.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.tenThanh.toLowerCase().includes(searchTerm.toLowerCase());
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
        ngayGiaNhap: new Date().toISOString().split('T')[0],
        points: 0,
      };
      updatedMembers = [...members, newMember];
    }
    setMembers(updatedMembers);
    saveMembers(updatedMembers);
    setIsModalOpen(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-4 pb-16 max-w-[1500px] mx-auto animate-in fade-in duration-500">
      
      {/* Compact Minimalist Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-3 shadow-lg flex items-center justify-between gap-4 border border-white dark:border-slate-800">
        
        <div className="flex items-center flex-1 gap-3 ml-2">
          <div className="relative group w-full max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
            <input 
              type="text" 
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border-none outline-none text-[11px] font-bold text-slate-500 shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-black/5 cursor-pointer">
             <Filter size={12} style={isSpring ? { color: springColor } : { color: '#BC8F44' }} />
             <select 
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-transparent text-[9px] font-black text-slate-500 uppercase outline-none tracking-widest appearance-none pr-4"
             >
                <option value="Tất cả">VAI TRÒ</option>
                {Object.values(MemberRole).map(role => <option key={role} value={role}>{role}</option>)}
             </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pr-1">
          <button onClick={() => setShowAnalysis(!showAnalysis)} className={`p-2.5 rounded-lg transition-all ${showAnalysis ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <PieChartIcon size={16} />
          </button>
          <div className="w-px h-5 bg-slate-100 dark:bg-slate-800 mx-1"></div>
          
          <button className="p-2.5 text-slate-400 hover:text-[#BC8F44] transition-all" title="Nhập"><Upload size={16} /></button>
          <button className="p-2.5 text-slate-400 hover:text-emerald-500 transition-all" title="Xuất"><Download size={16} /></button>
          <button className="p-2.5 text-slate-400 hover:text-blue-500 transition-all" title="In"><Printer size={16} /></button>
          
          <button 
            onClick={() => {
              setEditingMember(null);
              setFormData({ tenThanh: '', hoTen: '', vaiTro: MemberRole.CaVien, trangThai: Status.Active, gioiTinh: Gender.Nam, queQuan: '', soDienThoai: '', ngaySinh: '1995-01-01', ghiChu: '' });
              setIsModalOpen(true);
            }} 
            style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#BC8F44' }}
            className="ml-2 p-2.5 text-white rounded-lg shadow-md hover:scale-105 transition-all"
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Mini Analysis Bar */}
      {showAnalysis && analysis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-white dark:border-slate-800 shadow-sm">
            <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-1">Tổng nhân sự</p>
            <p className="text-xl font-black text-slate-800 dark:text-white leading-none">{analysis.total}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-white dark:border-slate-800 shadow-sm flex items-center gap-4">
             <div>
               <p className="text-[7px] font-black text-blue-400 uppercase tracking-widest mb-1">Nam</p>
               <p className="text-lg font-black text-blue-600 leading-none">{analysis.male}</p>
             </div>
             <div className="w-px h-6 bg-slate-50 dark:bg-slate-800"></div>
             <div>
               <p className="text-[7px] font-black text-pink-400 uppercase tracking-widest mb-1">Nữ</p>
               <p className="text-lg font-black text-pink-600 leading-none">{analysis.female}</p>
             </div>
          </div>
          <div className="col-span-2 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-white dark:border-slate-800 shadow-sm flex items-center gap-4 overflow-x-auto no-scrollbar">
             {analysis.roleStats.filter(rs => rs.count > 0).map((rs, i) => (
               <div key={i} className="flex flex-col items-center">
                  <span style={isSpring ? { color: springColor } : { color: '#BC8F44' }} className="text-xs font-black">{rs.count}</span>
                  <span className="text-[6px] font-black text-slate-300 uppercase tracking-tight">{rs.role}</span>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* The List View (Table) */}
      <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-xl overflow-hidden border border-white dark:border-slate-800">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="py-4 pl-8 pr-2 text-[8px] font-black text-slate-400 uppercase tracking-widest w-12 text-center">STT</th>
                <th className="py-4 px-4 text-[8px] font-black text-slate-400 uppercase tracking-widest">Họ & Tên</th>
                <th className="py-4 px-4 text-[8px] font-black text-slate-400 uppercase tracking-widest">Vai Trò</th>
                <th className="py-4 px-4 text-[8px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Số điện thoại</th>
                <th className="py-4 px-4 text-[8px] font-black text-slate-400 uppercase tracking-widest">Trạng Thái</th>
                <th className="py-4 pr-8 pl-4 text-right text-[8px] font-black text-slate-400 uppercase tracking-widest w-24">Tác Vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredMembers.map((m, idx) => (
                <tr key={m.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 pl-8 pr-2 text-center">
                    <span className="text-[10px] font-black text-slate-200 group-hover:text-slate-400">{(idx + 1).toString().padStart(2, '0')}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div 
                        style={isSpring ? { backgroundColor: springColor + '10', color: springColor, borderColor: springColor + '20' } : { backgroundColor: '#BC8F4410', color: '#BC8F44', borderColor: '#BC8F4420' }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-[9px] border shadow-sm group-hover:scale-105 transition-transform"
                      >
                        {getInitials(m.hoTen)}
                      </div>
                      <div>
                        <h4 className="text-[12px] font-black text-[#0F172A] dark:text-white uppercase tracking-tight leading-none mb-1">{m.tenThanh} {m.hoTen}</h4>
                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest ${m.gioiTinh === Gender.Nam ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'}`}>{m.gioiTinh}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span 
                      style={m.vaiTro === MemberRole.TruongCaDoan || m.vaiTro === MemberRole.CaTruong ? (isSpring ? { color: springColor, borderColor: springColor + '40', backgroundColor: springColor + '08' } : { color: '#BC8F44', borderColor: '#BC8F4440', backgroundColor: '#BC8F4408' }) : {}}
                      className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${m.vaiTro === MemberRole.TruongCaDoan || m.vaiTro === MemberRole.CaTruong ? '' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700'}`}
                    >
                      {m.vaiTro}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Phone size={10} className="opacity-40" />
                      <span className="text-[10px] font-bold tracking-tighter">{m.soDienThoai || '---'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${m.trangThai === Status.Active ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${m.trangThai === Status.Active ? 'text-emerald-500' : 'text-slate-400'}`}>{m.trangThai}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-8 pl-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => { setEditingMember(m); setFormData(m); setIsModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-[#BC8F44] hover:bg-white rounded-md shadow-sm transition-all"><Edit3 size={13} /></button>
                      <button onClick={() => { if(window.confirm('Xóa?')) { const u = members.filter(x => x.id !== m.id); setMembers(u); saveMembers(u); } }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto no-scrollbar">
          <div className="bg-white dark:bg-slate-950 w-full max-w-5xl rounded-[3rem] shadow-2xl relative border border-white/10 animate-in zoom-in-95 duration-500 my-auto">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/20">
              <div className="flex items-center gap-6">
                <div 
                  style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#BC8F44' }}
                  className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-black/10"
                >
                  <UserCircle size={32} />
                </div>
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter leading-none dark:text-white">
                    {editingMember ? 'Cập Nhật Hồ Sơ' : 'Ghi Danh Mới'}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <div style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#BC8F44' }} className="w-1.5 h-1.5 rounded-full"></div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">QUẢN LÝ NHÂN SỰ ANGELCHOIR</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 bg-white dark:bg-slate-800 text-slate-300 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-slate-100 dark:border-slate-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  
                  {/* Section 1: Personal Info */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-800 pb-4">
                      <UserIcon size={16} style={isSpring ? { color: springColor } : { color: '#BC8F44' }} />
                      <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em]">THÔNG TIN CÁ NHÂN</h4>
                    </div>
                    
                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Tên Thánh</label>
                        <input type="text" required placeholder="Giuse, Maria, Teresa..." value={formData.tenThanh} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none outline-none text-[13px] font-bold shadow-inner focus:ring-2 focus:ring-opacity-50" style={{'--tw-ring-color': isSpring ? springColor : '#BC8F44'} as any} onChange={e => setFormData({...formData, tenThanh: e.target.value})}/>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Họ và Tên</label>
                        <input type="text" required placeholder="Nguyễn Văn A" value={formData.hoTen} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none outline-none text-[13px] font-bold shadow-inner focus:ring-2 focus:ring-opacity-50" style={{'--tw-ring-color': isSpring ? springColor : '#BC8F44'} as any} onChange={e => setFormData({...formData, hoTen: e.target.value})}/>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Giới Tính</label>
                          <select className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl outline-none text-[13px] font-bold appearance-none" value={formData.gioiTinh} onChange={e => setFormData({...formData, gioiTinh: e.target.value as Gender})}>
                            {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Ngày Sinh</label>
                          <div className="relative">
                            <CalendarDays size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                            <input type="date" required value={formData.ngaySinh} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl outline-none text-[13px] font-bold" onChange={e => setFormData({...formData, ngaySinh: e.target.value})}/>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Contact Info */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-800 pb-4">
                      <Contact size={16} style={isSpring ? { color: springColor } : { color: '#BC8F44' }} />
                      <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em]">THÔNG TIN LIÊN HỆ</h4>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Số Điện Thoại</label>
                        <div className="relative">
                          <Phone size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input type="tel" placeholder="09xx xxx xxx" value={formData.soDienThoai} className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none outline-none text-[13px] font-bold shadow-inner" onChange={e => setFormData({...formData, soDienThoai: e.target.value})}/>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Quê Quán / Địa Chỉ</label>
                        <div className="relative">
                          <MapPin size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input type="text" placeholder="Thành phố, Tỉnh..." value={formData.queQuan} className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none outline-none text-[13px] font-bold shadow-inner" onChange={e => setFormData({...formData, queQuan: e.target.value})}/>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Ghi Chú Đặc Biệt</label>
                        <div className="relative">
                          <FileText size={14} className="absolute left-6 top-5 text-slate-300" />
                          <textarea rows={3} placeholder="Sở trường, nhạc cụ, bệnh lý..." value={formData.ghiChu} className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none outline-none text-[13px] font-bold shadow-inner resize-none" onChange={e => setFormData({...formData, ghiChu: e.target.value})}></textarea>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: System Role & Status */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-800 pb-4">
                      <ShieldCheck size={16} style={isSpring ? { color: springColor } : { color: '#BC8F44' }} />
                      <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em]">VAI TRÒ & TRẠNG THÁI</h4>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] space-y-5 shadow-inner border border-white/5">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Chức vụ trong Ca đoàn</label>
                          <div className="relative">
                            <Briefcase size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <select className="w-full pl-11 pr-6 py-4 rounded-xl bg-white dark:bg-slate-800 outline-none text-[13px] font-bold shadow-sm" value={formData.vaiTro} onChange={e => setFormData({...formData, vaiTro: e.target.value as MemberRole})}>
                              {Object.values(MemberRole).map(role => <option key={role} value={role}>{role}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Trạng thái hoạt động</label>
                          <div className="grid grid-cols-2 gap-3">
                            {Object.values(Status).map(s => (
                              <button 
                                key={s} 
                                type="button" 
                                onClick={() => setFormData({...formData, trangThai: s})} 
                                className={`py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${formData.trangThai === s ? (isSpring ? 'bg-white border-red-500 text-red-600 shadow-md' : 'bg-white border-[#BC8F44] text-[#BC8F44] shadow-md') : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-300'}`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-5 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20 flex gap-4">
                         <Info size={20} className="text-amber-500 shrink-0" />
                         <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold leading-relaxed">
                           Mọi thay đổi sẽ được lưu trữ vào hệ thống quản lý tập trung và tự động cập nhật báo cáo tháng.
                         </p>
                      </div>
                    </div>
                  </div>
              </div>

              {/* Form Actions */}
              <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex gap-6">
                <button 
                  type="submit" 
                  style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }}
                  className="flex-1 py-5 text-white rounded-full text-[11px] font-black tracking-[0.4em] uppercase shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4"
                >
                  XÁC NHẬN LƯU HỒ SƠ <CheckCircle2 size={18} />
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-14 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[11px] font-black tracking-widest uppercase hover:bg-red-500 hover:text-white transition-all border border-slate-200 dark:border-slate-700"
                >
                  HỦY BỎ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
