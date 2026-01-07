
import React, { useState, useEffect } from 'react';
/* Added Plus to the import list from lucide-react */
import { Camera, User, Palette, Shield, Database, Trash2, CheckCircle, RefreshCw, Save, ChevronRight, Sparkles, Plus } from 'lucide-react';
import { getCurrentUser, updateUserProfile, getSpringColor, saveSpringColor } from '../store';

const Settings: React.FC = () => {
  const user = getCurrentUser();
  const [fullName, setFullName] = useState(user.fullName);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user.avatar);
  const [saveStatus, setSaveStatus] = useState(false);
  const [springPrimary, setSpringPrimary] = useState(getSpringColor());

  const currentTheme = localStorage.getItem('theme') || 'light';
  const isSpring = currentTheme === 'spring';

  const springPresets = [
    { name: 'Classic Red', color: '#7F1D1D' },
    { name: 'Forest Green', color: '#064E3B' },
    { name: 'Royal Blue', color: '#1E3A8A' },
    { name: 'Deep Purple', color: '#4C1D95' },
    { name: 'Earthy Brown', color: '#451A03' },
    { name: 'Vibrant Orange', color: '#9A3412' }
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

  const handleSaveProfile = () => {
    updateUserProfile(fullName, avatarPreview);
    setSaveStatus(true);
    setTimeout(() => {
      setSaveStatus(false);
      window.location.reload();
    }, 1000);
  };

  const handleSpringColorChange = (color: string) => {
    setSpringPrimary(color);
    saveSpringColor(color);
  };

  const clearData = () => {
    if (window.confirm('CẢNH BÁO: Thao tác này sẽ xóa TOÀN BỘ dữ liệu. Bạn có chắc chắn không?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 animate-in fade-in duration-700 pb-20 px-4">
      <div className="flex flex-col gap-1 ml-4 border-l-4 border-[#BC8F44] pl-6 py-2">
         <h2 className={`text-4xl font-black uppercase tracking-tighter ${isSpring ? 'text-slate-800' : 'text-[#0F172A] dark:text-white'}`}>Cài đặt hệ thống</h2>
         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">QUẢN LÝ TÀI KHOẢN VÀ CẤU HÌNH GIAO DIỆN</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-4 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-xl border border-white dark:border-slate-800 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#BC8F44]/20"></div>
            <div className="relative inline-block mb-8 group mt-4">
              <div className="w-40 h-40 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center transition-all group-hover:scale-[1.02]">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-slate-200" />
                )}
              </div>
              <label className="absolute -bottom-3 -right-3 w-12 h-12 bg-[#BC8F44] text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-2xl hover:scale-110 active:scale-95 transition-all">
                <Camera size={22} />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>
            <h3 className="font-black text-[#0F172A] dark:text-white uppercase text-lg tracking-tight mb-1">{user.fullName}</h3>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full mt-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg"></span>
               <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{user.role}</p>
            </div>
          </div>

          {/* Theme Personalization Section */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-xl border border-white dark:border-slate-800">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
              <Palette size={14} style={isSpring ? { color: springPrimary } : { color: '#BC8F44' }} /> CÁ NHÂN HÓA SPRING
            </h4>
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Màu chủ đạo sidebar</p>
                <div className="grid grid-cols-4 gap-3">
                  {springPresets.map(preset => (
                    <button 
                      key={preset.color}
                      onClick={() => handleSpringColorChange(preset.color)}
                      style={{ backgroundColor: preset.color }}
                      className={`h-10 rounded-xl transition-all shadow-inner hover:scale-110 relative ${springPrimary === preset.color ? 'ring-4 ring-amber-400 ring-offset-2' : ''}`}
                      title={preset.name}
                    >
                      {springPrimary === preset.color && <CheckCircle className="absolute -top-1 -right-1 text-white bg-amber-400 rounded-full" size={14} />}
                    </button>
                  ))}
                  <div className="relative group flex items-center justify-center">
                    <input 
                      type="color" 
                      value={springPrimary}
                      onChange={(e) => handleSpringColorChange(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-full h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <Plus size={16} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-4">
                 <div style={{ backgroundColor: springPrimary }} className="w-8 h-8 rounded-lg shadow-lg"></div>
                 <span className="text-[10px] font-mono font-bold text-slate-500">{springPrimary.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-8 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 shadow-xl border border-white dark:border-slate-800">
            <h3 className="text-xl font-black text-[#0F172A] dark:text-white uppercase tracking-tighter mb-10 flex items-center gap-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-2xl text-amber-500 shadow-inner">
                <User size={24} />
              </div> 
              THÔNG TIN TÀI KHOẢN
            </h3>
            
            <div className="space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Tên hiển thị công khai</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-10 py-5 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-none outline-none text-base font-bold dark:text-white shadow-inner focus:ring-4 focus:ring-[#BC8F44]/10 transition-all"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleSaveProfile}
                  style={isSpring ? { backgroundColor: springPrimary } : { backgroundColor: '#0F172A' }}
                  className={`px-12 py-6 text-white rounded-full text-[11px] font-black tracking-[0.4em] uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4`}
                >
                  {saveStatus ? <CheckCircle size={20} /> : <Save size={20} />} 
                  {saveStatus ? 'ĐÃ CẬP NHẬT' : 'LƯU THAY ĐỔI'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 shadow-xl border border-red-50 dark:border-red-900/10 relative overflow-hidden group">
            <div className="relative z-10">
               <h3 className="text-xl font-black text-[#0F172A] dark:text-white uppercase tracking-tighter mb-4 flex items-center gap-4">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-500 shadow-inner">
                  <Database size={24} />
                </div> 
                DỮ LIỆU CỤC BỘ
              </h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-10 max-w-md opacity-80">Xóa dữ liệu trình duyệt để bắt đầu một ca đoàn mới.</p>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={clearData}
                  className="flex items-center gap-4 px-10 py-5 bg-red-500 text-white rounded-full text-[10px] font-black tracking-widest uppercase shadow-xl shadow-red-500/20 hover:bg-red-600 hover:scale-105 transition-all"
                >
                  <Trash2 size={18} /> RESET DỮ LIỆU
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-4 px-10 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-[10px] font-black tracking-widest uppercase hover:bg-slate-200 transition-all"
                >
                  <RefreshCw size={18} /> TẢI LẠI
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
