
import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  User, 
  Palette, 
  Database, 
  Trash2, 
  CheckCircle, 
  Save, 
  Sparkles, 
  Plus, 
  Download, 
  Upload, 
  Info, 
  History, 
  ShieldCheck,
  Smartphone,
  Layout,
  BellRing,
  Eye,
  EyeOff,
  Type
} from 'lucide-react';
import { 
  getCurrentUser, 
  updateUserProfile, 
  getSpringColor, 
  saveSpringColor, 
  exportSystemData, 
  importSystemData,
  getNotice,
  saveNotice
} from '../store';

const Settings: React.FC = () => {
  const user = getCurrentUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(user.fullName);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user.avatar);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [springPrimary, setSpringPrimary] = useState(getSpringColor());
  const [localStorageSize, setLocalStorageSize] = useState('0 KB');

  // Notice states
  const [notice, setNotice] = useState(getNotice());

  const currentTheme = localStorage.getItem('theme') || 'light';
  const isSpring = currentTheme === 'spring';

  useEffect(() => {
    // Tính toán dung lượng đã sử dụng
    let total = 0;
    for (const x in localStorage) {
      if (localStorage.hasOwnProperty(x)) {
        total += ((localStorage[x].length + x.length) * 2);
      }
    }
    setLocalStorageSize((total / 1024).toFixed(2) + ' KB');
  }, []);

  const springPresets = [
    { name: 'Red Wine', color: '#7F1D1D' },
    { name: 'Emerald', color: '#064E3B' },
    { name: 'Royal', color: '#1E3A8A' },
    { name: 'Indigo', color: '#312E81' },
    { name: 'Chocolate', color: '#451A03' },
    { name: 'Autumn', color: '#9A3412' },
    { name: 'Charcoal', color: '#0F172A' },
    { name: 'Teal', color: '#134E4A' }
  ];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAll = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      updateUserProfile(fullName, avatarPreview);
      saveNotice(notice);
      setSaveStatus('success');
      setTimeout(() => {
        setSaveStatus('idle');
        window.location.reload();
      }, 1000);
    }, 600);
  };

  const handleSpringColorChange = (color: string) => {
    setSpringPrimary(color);
    saveSpringColor(color);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (importSystemData(content)) {
          alert('Khôi phục dữ liệu thành công! Hệ thống sẽ khởi động lại.');
          window.location.reload();
        } else {
          alert('File không hợp lệ.');
        }
      };
      reader.readAsText(file);
    }
  };

  const clearData = () => {
    if (window.confirm('CẢNH BÁO: Thao tác này sẽ xóa TOÀN BỘ dữ liệu bao gồm ca viên và lịch tập. Bạn có chắc chắn không?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-4">
      
      {/* Header Section */}
      <div className="flex flex-col gap-2 ml-4">
         <h2 className={`text-5xl font-black uppercase tracking-tighter ${isSpring ? 'text-slate-800' : 'text-[#0F172A] dark:text-white'}`}>Cấu hình hệ thống</h2>
         <div className="flex items-center gap-3">
            <div style={isSpring ? { backgroundColor: springPrimary } : { backgroundColor: '#BC8F44' }} className="h-1 w-12 rounded-full"></div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em]">Quản trị viên: {user.fullName}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Summary & Theme */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Profile Quick Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 shadow-2xl shadow-black/5 border border-white dark:border-slate-800 text-center relative overflow-hidden group">
            <div style={isSpring ? { backgroundColor: springPrimary } : { backgroundColor: '#BC8F44' }} className="absolute top-0 left-0 w-full h-2 opacity-20"></div>
            
            <div className="relative inline-block mb-8 group mt-4">
              <div className="w-44 h-44 rounded-[3rem] bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center transition-all group-hover:scale-[1.02] shadow-inner">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-slate-200" />
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                style={isSpring ? { backgroundColor: springPrimary } : { backgroundColor: '#BC8F44' }}
                className="absolute -bottom-2 -right-2 w-14 h-14 text-white rounded-[1.5rem] flex items-center justify-center cursor-pointer shadow-2xl hover:scale-110 active:scale-95 transition-all border-4 border-white dark:border-slate-900"
              >
                <Camera size={24} />
              </button>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </div>

            <h3 className="font-black text-2xl text-[#0F172A] dark:text-white uppercase tracking-tighter mb-1">{fullName || 'ADMIN'}</h3>
            <div className="flex flex-col items-center gap-2">
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-slate-50 dark:bg-slate-800 rounded-full border border-black/5">
                <ShieldCheck size={14} className="text-emerald-500" />
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{user.role}</p>
              </div>
            </div>
          </div>

          {/* Theme Personalization */}
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 shadow-2xl shadow-black/5 border border-white dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                <Palette size={16} style={isSpring ? { color: springPrimary } : { color: '#BC8F44' }} /> Giao diện Xuân
              </h4>
              {isSpring && (
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              )}
            </div>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-2">Bảng màu hệ thống</p>
                <div className="grid grid-cols-4 gap-3">
                  {springPresets.map(preset => (
                    <button 
                      key={preset.color}
                      onClick={() => handleSpringColorChange(preset.color)}
                      style={{ backgroundColor: preset.color }}
                      className={`h-12 rounded-2xl transition-all shadow-lg hover:scale-110 relative ${springPrimary === preset.color ? 'ring-4 ring-amber-400 ring-offset-4 dark:ring-offset-slate-900' : 'opacity-80 hover:opacity-100'}`}
                      title={preset.name}
                    >
                      {springPrimary === preset.color && (
                        <CheckCircle className="absolute -top-2 -right-2 text-white bg-amber-400 rounded-full p-0.5" size={18} />
                      )}
                    </button>
                  ))}
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="color" 
                      value={springPrimary}
                      onChange={(e) => handleSpringColorChange(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 transition-colors group-hover:border-[#BC8F44]">
                      <Plus size={20} />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-black/5 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div style={{ backgroundColor: springPrimary }} className="w-10 h-10 rounded-xl shadow-xl shadow-black/10 transition-all duration-500"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Mã màu hex</span>
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{springPrimary.toUpperCase()}</span>
                    </div>
                 </div>
                 <Sparkles size={18} style={{ color: springPrimary }} className="opacity-40" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Config */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Dashboard Notice Config */}
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 shadow-2xl shadow-black/5 border border-white dark:border-slate-800 relative overflow-hidden group">
            <h3 className="text-2xl font-black text-[#0F172A] dark:text-white uppercase tracking-tighter mb-10 flex items-center gap-5">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-3xl">
                <BellRing size={28} />
              </div> 
              THÔNG BÁO DASHBOARD
            </h3>

            <div className="space-y-8 relative z-10">
               <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-black/5">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${notice.isVisible ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                      {notice.isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                    </div>
                    <div>
                      <h4 className="text-[13px] font-black text-[#0F172A] dark:text-white uppercase tracking-tight">Trạng thái hiển thị</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Bật/Tắt thông báo trên bảng điều khiển</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setNotice({...notice, isVisible: !notice.isVisible})}
                    className={`w-16 h-8 rounded-full relative transition-all duration-300 ${notice.isVisible ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${notice.isVisible ? 'left-9' : 'left-1'}`}></div>
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-6">Tiêu đề thông báo</label>
                    <div className="relative">
                      <Type size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="text" 
                        value={notice.title}
                        onChange={(e) => setNotice({...notice, title: e.target.value})}
                        className="w-full pl-14 pr-8 py-5 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-none outline-none text-sm font-bold dark:text-white shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-6">Văn bản nút bấm</label>
                    <input 
                      type="text" 
                      value={notice.buttonText}
                      onChange={(e) => setNotice({...notice, buttonText: e.target.value})}
                      className="w-full px-10 py-5 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-none outline-none text-sm font-bold dark:text-white shadow-inner"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-6">Nội dung chi tiết</label>
                    <textarea 
                      rows={3}
                      value={notice.content}
                      onChange={(e) => setNotice({...notice, content: e.target.value})}
                      className="w-full px-10 py-6 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-none outline-none text-sm font-bold dark:text-white shadow-inner resize-none"
                    ></textarea>
                  </div>
               </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 shadow-2xl shadow-black/5 border border-white dark:border-slate-800 relative overflow-hidden">
            <h3 className="text-2xl font-black text-[#0F172A] dark:text-white uppercase tracking-tighter mb-12 flex items-center gap-5">
              <div style={isSpring ? { backgroundColor: springPrimary + '20', color: springPrimary } : { backgroundColor: '#BC8F4420', color: '#BC8F44' }} className="p-4 rounded-3xl">
                <User size={28} />
              </div> 
              THÔNG TIN CÁ NHÂN
            </h3>
            
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-6">Tên Hiển Thị</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-10 py-6 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border-none outline-none text-base font-bold dark:text-white shadow-inner focus:ring-4 focus:ring-[#BC8F44]/5 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-6">Cấp Bậc Quản Trị</label>
                  <div className="w-full px-10 py-6 bg-slate-100 dark:bg-slate-900/50 rounded-[2.5rem] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-between">
                    {user.role}
                    <ShieldCheck size={18} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-50 dark:border-slate-800">
                <button 
                  onClick={handleSaveAll}
                  disabled={saveStatus !== 'idle'}
                  style={isSpring ? { backgroundColor: springPrimary } : { backgroundColor: '#0F172A' }}
                  className="px-14 py-6 text-white rounded-full text-[11px] font-black tracking-[0.4em] uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50"
                >
                  {saveStatus === 'saving' ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : saveStatus === 'success' ? (
                    <CheckCircle size={20} />
                  ) : (
                    <Save size={20} />
                  )} 
                  {saveStatus === 'saving' ? 'ĐANG LƯU...' : saveStatus === 'success' ? 'ĐÃ CẬP NHẬT' : 'LƯU TẤT CẢ'}
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Data Management */}
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 shadow-2xl shadow-black/5 border border-white dark:border-slate-800">
            <h3 className="text-2xl font-black text-[#0F172A] dark:text-white uppercase tracking-tighter mb-12 flex items-center gap-5">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-3xl">
                <Database size={28} />
              </div> 
              QUẢN TRỊ DỮ LIỆU
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[3rem] space-y-6">
                <div className="flex items-center gap-4 mb-2">
                   <History size={20} className="text-indigo-500" />
                   <h4 className="text-[12px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Sao lưu & Phục hồi</h4>
                </div>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  Xuất toàn bộ dữ liệu ra file .json để lưu trữ an toàn.
                </p>
                <div className="flex gap-4 pt-2">
                  <button onClick={exportSystemData} className="flex-1 flex items-center justify-center gap-3 py-4 bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[10px] font-black tracking-widest uppercase border border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-50 transition-all">
                    <Download size={16} /> XUẤT
                  </button>
                  <button onClick={() => importInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all">
                    <Upload size={16} /> NHẬP
                  </button>
                  <input ref={importInputRef} type="file" className="hidden" accept=".json" onChange={handleImport} />
                </div>
              </div>

              <div className="p-8 bg-red-50/30 dark:bg-red-900/10 rounded-[3rem] border border-red-100 dark:border-red-900/20 space-y-6">
                <div className="flex items-center gap-4 mb-2">
                   <Trash2 size={20} className="text-red-500" />
                   <h4 className="text-[12px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Danger Zone</h4>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest px-2">
                  <span>Dung lượng bộ nhớ:</span>
                  <span className="text-red-500">{localStorageSize}</span>
                </div>
                <button onClick={clearData} className="w-full py-4 bg-white dark:bg-slate-800 text-red-500 border border-red-200 dark:border-red-900/30 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/5">
                  XÓA VĨNH VIỄN DỮ LIỆU
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
