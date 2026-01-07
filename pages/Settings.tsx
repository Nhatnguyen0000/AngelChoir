
import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, User, Palette, Database, Trash2, 
  Save, Sparkles, Download, 
  Upload, ShieldCheck, BellRing, Check,
  Cpu, HardDrive, Info, Settings as SettingsIcon,
  RefreshCcw, LogOut
} from 'lucide-react';
import { 
  getCurrentUser, updateUserProfile, getSpringColor, 
  saveSpringColor, exportSystemData, importSystemData,
  getNotice, saveNotice
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

  const [notice, setNotice] = useState(getNotice());

  const currentTheme = localStorage.getItem('theme') || 'light';
  const isSpring = currentTheme === 'spring';

  useEffect(() => {
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
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAll = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      updateUserProfile(fullName, avatarPreview);
      saveNotice(notice);
      saveSpringColor(springPrimary);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1200);
  };

  const handleSpringColorChange = (color: string) => setSpringPrimary(color);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (importSystemData(content)) {
          alert('Cấu trúc dữ liệu đã được phục hồi thành công!');
          window.location.reload();
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-[1500px] mx-auto space-y-10 animate-in fade-in duration-700 pb-32 px-4">
      
      {/* Page Header */}
      <div className="flex items-center justify-between px-4">
        <div className="flex flex-col gap-1">
           <h2 className={`text-5xl font-black uppercase tracking-tighter ${isSpring ? 'text-slate-800' : 'text-[#0F172A] dark:text-white'}`}>Cài Đặt Hệ Thống</h2>
           <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#BC8F44] animate-pulse"></span>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Kiểm soát cấu hình AngelChoir v4.5 Enterprise</p>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex flex-col text-right hidden sm:block">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bộ nhớ đã dùng</span>
              <p className="text-sm font-black text-slate-800 dark:text-white">{localStorageSize}</p>
           </div>
           <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-black/5 shadow-md">
              <HardDrive size={20} className="text-blue-500" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Profile & Branding */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Section: Profile */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[3rem] p-10 shadow-2xl border border-white dark:border-slate-800 flex flex-col items-center">
             <div className="relative group mb-10">
                <div className="w-36 h-36 rounded-[3rem] bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-700 overflow-hidden flex items-center justify-center shadow-2xl">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center opacity-20">
                      <User size={64} />
                      <p className="text-[8px] font-black uppercase mt-2">No Photo</p>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  style={isSpring ? { backgroundColor: springPrimary } : { backgroundColor: '#BC8F44' }} 
                  className="absolute -bottom-2 -right-2 w-12 h-12 text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all border-4 border-white dark:border-slate-900"
                >
                  <Camera size={20} />
                </button>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
             </div>
             
             <div className="w-full space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Định danh hiển thị</label>
                   <div className="relative">
                      <User size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="text" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                        className="w-full pl-14 pr-8 py-5 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border-none outline-none text-base font-bold dark:text-white shadow-inner focus:ring-4 focus:ring-black/5 transition-all"
                      />
                   </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100/50">
                   <div className="flex items-center gap-3">
                      <ShieldCheck size={18} className="text-emerald-500" />
                      <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Cấp bậc quản trị</span>
                   </div>
                   <p className="text-xs font-black text-emerald-700">{user.role.toUpperCase()}</p>
                </div>
             </div>
          </div>

          {/* Section: Branding */}
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[3rem] p-10 shadow-xl border border-white dark:border-slate-800">
              <div className="flex items-center justify-between mb-8">
                 <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                   <Palette size={18} style={{ color: springPrimary }} /> Nhận diện AngelChoir
                 </h4>
                 <Sparkles size={16} className="text-amber-400" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {springPresets.map(preset => (
                  <button 
                    key={preset.color} 
                    onClick={() => handleSpringColorChange(preset.color)} 
                    style={{ backgroundColor: preset.color }} 
                    className={`h-11 rounded-2xl transition-all relative group shadow-md ${
                      springPrimary === preset.color ? 'ring-4 ring-amber-400 ring-offset-4 dark:ring-offset-slate-900' : 'hover:scale-105 active:scale-95'
                    }`}
                    title={preset.name}
                  >
                    {springPrimary === preset.color && <Check className="absolute inset-0 m-auto text-white drop-shadow-md" size={18} />}
                  </button>
                ))}
              </div>
              <div className="mt-8 p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-between border border-black/5 shadow-inner">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PRIMARY HEX</span>
                <span className="text-xs font-mono font-black text-slate-800 dark:text-slate-200 tracking-wider">
                  {springPrimary.toUpperCase()}
                </span>
              </div>
          </div>
        </div>

        {/* Right Column: Broadcast & Data Management */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section: System Notice */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[3rem] p-10 shadow-2xl border border-white dark:border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
              
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner">
                    <BellRing size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">Bản tin thông báo</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Hiển thị trực tiếp tại Dashboard</p>
                  </div>
                </div>
                <button 
                  onClick={() => setNotice({...notice, isVisible: !notice.isVisible})} 
                  className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
                    notice.isVisible ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {notice.isVisible ? 'Hệ thống đang phát' : 'Đã ngưng phát'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Tiêu đề bản tin</label>
                  <input type="text" value={notice.title} onChange={(e) => setNotice({...notice, title: e.target.value})} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border-none outline-none text-sm font-bold dark:text-white shadow-inner focus:ring-4 focus:ring-black/5 transition-all"/>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Nội dung nút hành động</label>
                  <input type="text" value={notice.buttonText} onChange={(e) => setNotice({...notice, buttonText: e.target.value})} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border-none outline-none text-sm font-bold dark:text-white shadow-inner focus:ring-4 focus:ring-black/5 transition-all"/>
                </div>
                <div className="md:col-span-2 space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Nội dung chi tiết</label>
                   <textarea rows={3} value={notice.content} onChange={(e) => setNotice({...notice, content: e.target.value})} className="w-full px-10 py-7 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border-none outline-none text-sm font-bold dark:text-white shadow-inner resize-none focus:ring-4 focus:ring-black/5 transition-all"></textarea>
                </div>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Section: Data Backup */}
             <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[3rem] p-10 shadow-xl border border-white dark:border-slate-800">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-500">
                      <Database size={20} />
                   </div>
                   <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">Cơ sở dữ liệu</h4>
                </div>
                <div className="flex flex-col gap-4">
                   <button onClick={exportSystemData} className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-3 shadow-sm">
                      <Download size={16} /> SAO LƯU DỮ LIỆU (.JSON)
                   </button>
                   <button onClick={() => importInputRef.current?.click()} className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20">
                      <Upload size={16} /> KHÔI PHỤC HỆ THỐNG
                   </button>
                   <input ref={importInputRef} type="file" className="hidden" accept=".json" onChange={handleImport} />
                </div>
             </div>

             {/* Section: Security & Maintenance */}
             <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[3rem] p-10 shadow-xl border border-white dark:border-slate-800">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-500">
                      <Trash2 size={20} />
                   </div>
                   <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">Vùng bảo mật & Bảo trì</h4>
                </div>
                <div className="space-y-4">
                   <div className="p-5 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Dung lượng rác</span>
                        <p className="text-sm font-black text-red-700 dark:text-red-400">{localStorageSize}</p>
                      </div>
                      <RefreshCcw size={16} className="text-red-300 animate-spin-slow" />
                   </div>
                   <button 
                    onClick={() => { if(window.confirm('CẢNH BÁO: Toàn bộ dữ liệu thành viên, tài chính và cấu hình sẽ bị xóa sạch! Bạn có chắc chắn muốn thực hiện dọn dẹp toàn diện?')) { localStorage.clear(); window.location.reload(); } }} 
                    className="w-full py-5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-200 dark:border-red-800/50 shadow-sm"
                   >
                     DỌN DẸP TOÀN BỘ HỆ THỐNG
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Global Save Button */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={handleSaveAll} 
          disabled={saveStatus !== 'idle'} 
          style={isSpring ? { backgroundColor: springPrimary } : { backgroundColor: '#0F172A' }} 
          className="px-16 py-7 text-white rounded-full text-[14px] font-black tracking-[0.4em] uppercase shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-4 border border-white/20 group"
        >
          {saveStatus === 'saving' ? (
            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : saveStatus === 'success' ? (
            <Check size={22} className="text-emerald-400" />
          ) : (
            <Save size={22} className="group-hover:rotate-12 transition-transform" />
          )} 
          {saveStatus === 'saving' ? 'ĐANG TỐI ƯU HÓA...' : saveStatus === 'success' ? 'CẬP NHẬT THÀNH CÔNG' : 'LƯU CẤU HÌNH HỆ THỐNG'}
        </button>
      </div>

      {/* Bottom Info Section */}
      <div className="flex flex-col items-center gap-3 pt-12 opacity-30">
         <div className="flex items-center gap-3">
            <Cpu size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">AngelChoir Infrastructure v4.5.2</span>
         </div>
         <p className="text-[8px] font-bold uppercase tracking-widest">© 2024 AngelChoir - Chuyên nghiệp hóa hoạt động ca đoàn</p>
      </div>
    </div>
  );
};

export default Settings;
