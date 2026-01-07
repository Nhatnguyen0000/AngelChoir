
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
  Layers,
  ChevronDown,
  Info,
  Contact,
  Briefcase,
  CheckCircle2,
  MapPin,
  Printer,
  Upload
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
      return { role, count, percent: ((count / total) * 100).toFixed(1) };
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
    <div className="space-y-6 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* Redesigned Compact Action Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 shadow-2xl shadow-black/5 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 border border-white dark:border-slate-800/50">
        
        <div className="relative group flex-1 min-w-[250px] max-w-sm ml-4">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input 
            type="text" 
            placeholder="Tìm kiếm ca viên..."
            className="w-full pl-14 pr-6 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-full border-none outline-none text-[10px] font-bold text-slate-400 shadow-inner focus:ring-4 focus:ring-[#BC8F44]/5 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 px-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-black/5 min-w-[160px] justify-between group cursor-pointer">
          <div className="flex items-center gap-2">
             <Filter size={14} style={isSpring ? { color: springColor } : { color: '#BC8F44' }} />
             <select 
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-transparent text-[9px] font-black text-slate-500 uppercase outline-none cursor-pointer tracking-widest appearance-none pr-4"
             >
                <option value="Tất cả">VAI TRÒ</option>
                {Object.values(MemberRole).map(role => <option key={role} value={role}>{role}</option>)}
             </select>
          </div>
          <ChevronDown size={10} className="text-slate-300" />
        </div>

        <div className="flex items-center gap-2 pr-2">
          {/* Compact Analysis Toggle */}
          <button 
            onClick={() => setShowAnalysis(!showAnalysis)}
            style={showAnalysis ? (isSpring ? { backgroundColor: springColor } : { backgroundColor: '#354E4D' }) : {}}
            className={`p-3.5 rounded-xl transition-all ${showAnalysis ? 'text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100'}`}
            title="Phân tích"
          >
            <PieChartIcon size={18} />
          </button>

          <div className="w-px h-6 bg-slate-100 dark:bg-slate-800 mx-1"></div>

          {/* Compact Functional Icon Buttons */}
          <button 
            className="p-3.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-[#BC8F44] rounded-xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all active:scale-95"
            title="Nhập dữ liệu"
          >
            <Upload size={18} />
          </button>
          
          <button 
            className="p-3.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-600 rounded-xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all active:scale-95"
            title="Xuất Excel"
          >
            <Download size={18} />
          </button>

          <button 
            className="p-3.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-500 rounded-xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all active:scale-95"
            title="In danh sách"
          >
            <Printer size={18} />
          </button>

          <button 
            onClick={() => {
              setEditingMember(null);
              setFormData({ 
                tenThanh: '', hoTen: '', vaiTro: MemberRole.CaVien, 
                trangThai: Status.Active, gioiTinh: Gender.Nam, 
                queQuan: '', soDienThoai: '', ngaySinh: '1995-01-01',
                ghiChu: ''
              });
              setIsModalOpen(true);
            }} 
            style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#BC8F44' }}
            className="p-3.5 text-white rounded-xl shadow-lg hover:scale-105 transition-all"
            title="Thêm ca viên"
          >
            <Plus size={20} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Analysis Section */}
      {showAnalysis && analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-500">
          <div style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#354E4D' }} className="rounded-[2.5rem] p-6 text-white shadow-xl flex flex-col justify-between">
            <Layers size={20} className="opacity-20 mb-2" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-50 mb-1">Tổng nhân sự</p>
              <h3 className="text-3xl font-black tracking-tighter leading-none">{analysis.total}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-white dark:border-slate-800 shadow-xl flex flex-col justify-between">
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em] mb-4">Giới tính</p>
            <div className="flex gap-6">
              <div>
                <p className="text-xl font-black text-blue-600 leading-none">{analysis.male}</p>
                <p className="text-[7px] font-black text-slate-300 uppercase mt-1">Nam</p>
              </div>
              <div className="w-px h-6 bg-slate-50 dark:bg-slate-800"></div>
              <div>
                <p className="text-xl font-black text-pink-600 leading-none">{analysis.female}</p>
                <p className="text-[7px] font-black text-slate-300 uppercase mt-1">Nữ</p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-white dark:border-slate-800 shadow-xl flex items-center gap-6 overflow-x-auto no-scrollbar">
            {analysis.roleStats.map((rs, i) => (
              <div key={i} className="shrink-0 flex flex-col items-center gap-1">
                 <div style={isSpring ? { color: springColor } : { color: '#BC8F44' }} className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xs font-black border border-black/5">
                    {rs.count}
                 </div>
                 <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest text-center leading-tight">{rs.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl shadow-black/5 overflow-hidden border border-white dark:border-slate-800/50">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="py-6 pl-12 pr-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center w-20">STT</th>
                <th className="py-6 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Ca Viên</th>
                <th className="py-6 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Vai Trò</th>
                <th className="py-6 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Liên Hệ</th>
                <th className="py-6 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Trạng Thái</th>
                <th className="py-6 pr-12 pl-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest w-40">Tác Vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredMembers.map((m, idx) => (
                <tr key={m.id} className="group hover:bg-[#BC8F44]/5 transition-all duration-300">
                  <td className="py-5 pl-12 pr-4 text-center">
                    <span className="text-[11px] font-black text-slate-200 group-hover:text-[#BC8F44] transition-colors">{(idx + 1).toString().padStart(2, '0')}</span>
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-4">
                      <div style={isSpring ? { color: springColor } : { color: '#BC8F44' }} className="w-9 h-9 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center font-black text-[10px] border border-black/5 shadow-inner group-hover:bg-[#BC8F44] group-hover:text-white transition-all">
                        {getInitials(m.hoTen)}
                      </div>
                      <div>
                        <h4 className="text-[13px] font-black text-[#0F172A] dark:text-white uppercase tracking-tight leading-none mb-1">{m.tenThanh} {m.hoTen}</h4>
                        <div className="flex items-center gap-2">
                           <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest ${m.gioiTinh === Gender.Nam ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>{m.gioiTinh}</span>
                           <span className="text-[8px] text-slate-300 font-bold uppercase tracking-widest">{m.ngaySinh}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <span 
                      style={m.vaiTro === MemberRole.TruongCaDoan || m.vaiTro === MemberRole.CaTruong ? (isSpring ? { color: springColor, borderColor: springColor + '40', backgroundColor: springColor + '08' } : { color: '#BC8F44', borderColor: '#BC8F4440', backgroundColor: '#BC8F4408' }) : {}}
                      className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${m.vaiTro === MemberRole.TruongCaDoan || m.vaiTro === MemberRole.CaTruong ? '' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700'}`}
                    >
                      {m.vaiTro}
                    </span>
                  </td>
                  <td className="py-5 px-4 hidden md:table-cell">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Phone size={11} className="text-[#BC8F44]/60" />
                      <span className="text-[10px] font-black tracking-tighter">{m.soDienThoai || '---'}</span>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${m.trangThai === Status.Active ? 'bg-emerald-500 shadow-lg' : 'bg-slate-200'}`}></div>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${m.trangThai === Status.Active ? 'text-emerald-500' : 'text-slate-400'}`}>{m.trangThai}</span>
                    </div>
                  </td>
                  <td className="py-5 pr-12 pl-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingMember(m); setFormData(m); setIsModalOpen(true); }}
                        className="p-2 bg-white dark:bg-slate-800 text-slate-400 hover:text-[#BC8F44] rounded-lg shadow border border-slate-50 dark:border-slate-700 transition-all"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); if(window.confirm('Xóa vĩnh viễn hồ sơ này?')) { const u = members.filter(x => x.id !== m.id); setMembers(u); saveMembers(u); } }}
                        className="p-2 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-lg shadow transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Profile */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300 overflow-y-auto no-scrollbar">
          <div className={`bg-white dark:bg-slate-950 w-full max-w-5xl rounded-[3.5rem] shadow-2xl relative border ${isSpring ? 'border-amber-200/20' : 'border-white/10'} animate-in zoom-in-95 duration-500 my-auto`}>
            
            <div className={`p-10 md:p-12 border-b ${isSpring ? 'bg-amber-50/30 border-amber-100' : 'bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800'} rounded-t-[3.5rem] flex justify-between items-center`}>
              <div>
                <h3 style={isSpring ? { color: springColor } : {}} className={`text-3xl font-black uppercase tracking-tighter leading-none ${!isSpring ? 'text-[#0F172A] dark:text-white' : ''}`}>
                  {editingMember ? 'Cập Nhật Hồ Sơ' : 'Ghi Danh Mới'}
                </h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] mt-3 opacity-60">Hệ thống nhân sự AngelChoir</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-10 md:p-12 space-y-12">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                <div className="xl:col-span-7 space-y-10">
                  <div className="space-y-6">
                    <h4 style={isSpring ? { color: springColor } : { color: '#BC8F44' }} className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3">
                      <Info size={14} /> THÔNG TIN CÁ NHÂN
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Tên Thánh</label>
                        <input type="text" required value={formData.tenThanh} placeholder="Giuse / Maria..." className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] border-none outline-none text-xs font-bold shadow-inner focus:ring-4 focus:ring-[#BC8F44]/5 transition-all" onChange={e => setFormData({...formData, tenThanh: e.target.value})}/>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Họ và Tên</label>
                        <input type="text" required value={formData.hoTen} placeholder="Tên đầy đủ..." className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] border-none outline-none text-xs font-bold shadow-inner focus:ring-4 focus:ring-[#BC8F44]/5 transition-all" onChange={e => setFormData({...formData, hoTen: e.target.value})}/>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Giới Tính</label>
                        <div className="flex gap-2 p-1 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem]">
                          {Object.values(Gender).map(g => (
                            <button key={g} type="button" onClick={() => setFormData({...formData, gioiTinh: g})} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${formData.gioiTinh === g ? 'bg-white shadow-md text-[#BC8F44]' : 'text-slate-400 hover:text-slate-600'}`}>{g}</button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Ngày Sinh</label>
                        <input type="date" required value={formData.ngaySinh} className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] border-none outline-none text-xs font-bold shadow-inner" onChange={e => setFormData({...formData, ngaySinh: e.target.value})}/>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 style={isSpring ? { color: springColor } : { color: '#BC8F44' }} className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3">
                      <Contact size={14} /> LIÊN HỆ & ĐỊA CHỈ
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Số điện thoại</label>
                        <div className="relative">
                          <Phone size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input type="tel" value={formData.soDienThoai} placeholder="09xx..." className="w-full pl-14 pr-8 py-4 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] border-none outline-none text-xs font-bold shadow-inner" onChange={e => setFormData({...formData, soDienThoai: e.target.value})}/>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Quê quán</label>
                        <div className="relative">
                          <MapPin size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input type="text" value={formData.queQuan} placeholder="Nơi ở hiện tại..." className="w-full pl-14 pr-8 py-4 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] border-none outline-none text-xs font-bold shadow-inner" onChange={e => setFormData({...formData, queQuan: e.target.value})}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="xl:col-span-5 space-y-10">
                  <div className="space-y-6">
                    <h4 style={isSpring ? { color: springColor } : { color: '#BC8F44' }} className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3">
                      <Briefcase size={14} /> VAI TRÒ & TRẠNG THÁI
                    </h4>
                    <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] space-y-6 shadow-inner">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Chức vụ phụ trách</label>
                        <select className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border-none outline-none text-xs font-bold shadow-sm cursor-pointer" value={formData.vaiTro} onChange={e => setFormData({...formData, vaiTro: e.target.value as MemberRole})}>
                          {Object.values(MemberRole).map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Trạng thái công tác</label>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.values(Status).map(s => (
                            <button key={s} type="button" onClick={() => setFormData({...formData, trangThai: s})} className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${formData.trangThai === s ? 'bg-white border-[#BC8F44] text-[#BC8F44] shadow-md' : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-400'}`}>{s}</button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ghi chú năng khiếu</label>
                        <textarea rows={3} value={formData.ghiChu} placeholder="Bè, nhạc cụ, khả năng khác..." className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border-none outline-none text-[11px] font-bold shadow-sm resize-none" onChange={e => setFormData({...formData, ghiChu: e.target.value})}></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex gap-6">
                <button 
                  type="submit" 
                  style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#BC8F44' }}
                  className="flex-1 py-6 text-white rounded-full text-[11px] font-black tracking-[0.4em] uppercase shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-4"
                >
                  LƯU HỒ SƠ <CheckCircle2 size={20} />
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-12 py-6 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-[11px] font-black tracking-widest uppercase hover:bg-red-50 hover:text-red-500 transition-all">HỦY BỎ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
