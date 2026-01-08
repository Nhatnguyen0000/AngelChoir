
import React, { useState, useRef } from 'react';
import { 
  Camera, User, Palette, Database, Trash2, 
  Save, Sparkles, Download, 
  Upload, ShieldCheck, BellRing, Check,
  Cpu, HardDrive, Info, Loader2, RefreshCw,
  ChevronRight, Layout, Monitor, Globe, Settings as SettingsIcon,
  AlertTriangle
} from 'lucide-react';
import { 
  getCurrentUser, updateUserProfile, getSpringColor, 
  saveSpringColor, exportSystemData, importSystemData,
  getNotice, saveNotice
} from '../store';

const Settings: React.FC = () => {
  const user = getCurrentUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(user.fullName);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user.avatar);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [springPrimary, setSpringPrimary] = useState(getSpringColor());
  const [notice, setNotice] = useState(getNotice());
  const [activeSettingsTab, setActiveSettingsTab] = useState<'profile' | 'system' | 'advanced'>('profile');

  const currentTheme = localStorage.getItem('theme') || 'light';
  const isSpring = currentTheme === 'spring';

  const springPresets = [
    { name: 'Red Wine', color: '#7F1D1D' },
    { name: 'Emerald', color: '#064E3B' },
    { name: 'Royal Blue', color: '#1E3A8A' },
    { name: 'Autumn', color: '#9A3412' },
    { name: 'Deep Purple', color: '#4C1D95' },
    { name: 'Classic Charcoal', color: '#0F172A' }
  ];

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

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const success = importSystemData(ev.target?.result as string);
        if (success) alert('Khôi phục dữ liệu thành công! Vui lòng tải lại trang để áp dụng.');
        else alert('Lỗi khôi phục. Tệp tin không hợp lệ.');
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-[1500px] mx-auto space-y-8 animate-in fade-in duration-700 pb-40 px-4">
      
      {/* Settings Navigation Bar */}
      <div className="flex bg-white/60 dark:bg-slate-900/60 p-2 rounded-[2.5rem] border border-black/5 shadow-xl backdrop-blur-xl w-fit">
        {[
          { id: 'profile', label: 'Hồ sơ cá nhân', icon: User },
          { id: 'system', label: 'Hệ thống', icon: Layout },
          { id: 'advanced', label: 'Nâng cao', icon: Cpu }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveSettingsTab(tab.id as any)}
            className={`px-8 py-3.5 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeSettingsTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          
          {activeSettingsTab === 'profile' && (
            <div className="glass rounded-[3rem] p-12 shadow-2xl border border-white dark:border-slate-800 space-y-12 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-[3rem] bg-slate-50 dark:bg-slate-800 overflow-hidden border-4 border-white dark:border-slate-700 shadow-2xl transition-transform group-hover:scale-105">
                    {avatarPreview ? <img src={avatarPreview} className="w-full h-full object-cover" /> : <User size={60} className="m-auto mt-12 text-slate-200" />}
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-3 -right-3 w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-900 hover:scale-110 transition-all"><Camera size={20} /></button>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload = (ev) => setAvatarPreview(ev.target?.result as string); r.readAsDataURL(f); } }} />
                </div>
                <div className="flex-1 space-y-6 w-full">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Tên hiển thị Ban Điều Hành</label>
                    <input type="text" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-[1.8rem] border-none font-bold text-lg shadow-inner outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" value={fullName} onChange={e => setFullName(e.target.value)} />
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vai trò quyền hạn</span>
                      <div className="flex items-center gap-2 mt-1">
                        <ShieldCheck size={16} className="text-emerald-500" />
                        <span className="text-sm font-black uppercase dark:text-white">{user.role}</span>
                      </div>
                    </div>
                    <div className="w-px h-10 bg-slate-100 dark:bg-slate-800"></div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID Định danh hệ thống</span>
                      <span className="text-sm font-black uppercase dark:text-white">BH-{String(user.id).padStart(3, '0')}-ADMIN</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSettingsTab === 'system' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              {/* Spring Theme Configuration */}
              <div className="glass rounded-[3rem] p-10 shadow-xl border border-white dark:border-slate-800 space-y-10">
                <div className="flex items-center gap-4 border-b border-slate-50 dark:border-slate-800 pb-6">
                  <Palette size={24} className="text-[#BC8F44]" />
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tighter dark:text-white leading-none">Cấu hình Giao diện Spring</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Màu sắc chủ đạo cho toàn bộ hệ thống ca đoàn</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {springPresets.map(preset => (
                    <button 
                      key={preset.color}
                      onClick={() => setSpringPrimary(preset.color)}
                      style={{ backgroundColor: preset.color }}
                      className={`h-20 rounded-[1.8rem] transition-all relative group flex flex-col items-center justify-center gap-2 ${springPrimary === preset.color ? 'ring-4 ring-amber-400 ring-offset-8 dark:ring-offset-slate-900 shadow-2xl scale-105' : 'hover:scale-105 opacity-80'}`}
                    >
                      {springPrimary === preset.color && <Check size={24} className="text-white" />}
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/60">{preset.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex flex-col md:flex-row gap-6 pt-4">
                  <div className="flex-1 space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Mã màu tùy chỉnh (HEX)</label>
                    <div className="flex items-center gap-4">
                      <input type="color" value={springPrimary} onChange={e => setSpringPrimary(e.target.value)} className="w-16 h-16 bg-transparent border-none cursor-pointer p-0" />
                      <input type="text" value={springPrimary.toUpperCase()} onChange={e => setSpringPrimary(e.target.value)} className="flex-1 px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-mono font-bold border-none shadow-inner uppercase" />
                    </div>
                  </div>
                </div>
              </div>

              {/* System Notice Configuration */}
              <div className="glass rounded-[3rem] p-10 shadow-xl border border-white dark:border-slate-800 space-y-8">
                <div className="flex items-center gap-4 border-b border-slate-50 dark:border-slate-800 pb-6">
                  <BellRing size={24} className="text-amber-500" />
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tighter dark:text-white leading-none">Thông báo trang chủ (Banner)</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Nội dung hiển thị cho toàn thể ca viên</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-6 rounded-[1.8rem]">
                    <div className="flex items-center gap-4">
                      <Globe size={20} className="text-blue-500" />
                      <div><p className="text-[11px] font-black uppercase dark:text-white">Trạng thái Banner</p><p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Bật/tắt thông báo trên Bảng Điều Khiển</p></div>
                    </div>
                    <button onClick={() => setNotice({...notice, isVisible: !notice.isVisible})} className={`w-14 h-8 rounded-full transition-all relative ${notice.isVisible ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${notice.isVisible ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Tiêu đề thông báo</label>
                       <input type="text" placeholder="Tiêu đề..." className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm shadow-inner" value={notice.title} onChange={e => setNotice({...notice, title: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Nội dung chi tiết</label>
                       <textarea rows={2} placeholder="Nội dung..." className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm shadow-inner resize-none" value={notice.content} onChange={e => setNotice({...notice, content: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSettingsTab === 'advanced' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="glass rounded-[3rem] p-10 shadow-xl border border-white dark:border-slate-800 space-y-10">
                <div className="flex items-center gap-4 border-b border-slate-50 dark:border-slate-800 pb-6">
                  <Database size={24} className="text-indigo-500" />
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tighter dark:text-white leading-none">Trung tâm Dữ liệu AngelChoir</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Sao lưu, phục hồi và làm sạch kho lưu trữ</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[2.2rem] space-y-6 border border-black/5 hover:border-blue-500/20 transition-all group">
                    <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-500 mb-2 group-hover:scale-110 transition-transform"><Download size={28} /></div>
                    <div><h5 className="text-sm font-black uppercase dark:text-white">Sao lưu hệ thống (.JSON)</h5><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Xuất toàn bộ thông tin ca viên, lịch tập và tài chính</p></div>
                    <button onClick={exportSystemData} className="w-full py-4 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-lg transition-all flex items-center justify-center gap-2">Tải bản sao lưu <ChevronRight size={14} /></button>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[2.2rem] space-y-6 border border-black/5 hover:border-emerald-500/20 transition-all group">
                    <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-500 mb-2 group-hover:scale-110 transition-transform"><Upload size={28} /></div>
                    <div><h5 className="text-sm font-black uppercase dark:text-white">Khôi phục Dữ liệu</h5><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Nạp lại dữ liệu từ tệp tin JSON đã sao lưu trước đó</p></div>
                    <label className="w-full py-4 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer">
                      Chọn tệp khôi phục <ChevronRight size={14} />
                      <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                    </label>
                  </div>
                </div>

                <div className="p-8 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-[2.2rem] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <AlertTriangle size={24} className="text-red-500" />
                    <div><h5 className="text-sm font-black uppercase text-red-600">Xóa trắng toàn bộ dữ liệu</h5><p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mt-1">Cẩn thận: Hành động này sẽ đưa hệ thống về trạng thái ban đầu</p></div>
                  </div>
                  <button onClick={() => { if(window.confirm('CẢNH BÁO: Hành động này sẽ xóa sạch danh sách ca viên và mọi dữ liệu liên quan. Bạn có chắc chắn?')) { localStorage.clear(); window.location.reload(); } }} className="px-8 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg">Làm sạch kho</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Sidebar Section */}
        <div className="lg:col-span-4 space-y-8">
           <div className="glass rounded-[3rem] p-10 shadow-xl border border-white dark:border-slate-800 space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 shadow-inner"><Monitor size={22} /></div>
                 <div><h4 className="text-sm font-black uppercase dark:text-white">Trạng thái Hệ thống</h4><p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Đang trực tuyến</p></div>
              </div>
              <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400"><span>Bộ nhớ local</span><span>~4.5 MB</span></div>
                 <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-blue-500 w-[20%]"></div></div>
                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400"><span>Phiên bản App</span><span>v3.8.2-PRO</span></div>
                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400"><span>Mã hóa dữ liệu</span><span>AES-256 Mock</span></div>
              </div>
              <div className="pt-6 flex items-center gap-4">
                 <RefreshCw size={16} className="text-slate-300 animate-spin-slow" />
                 <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-tight">Đang đồng bộ hóa dữ liệu với AngelBrain...</span>
              </div>
           </div>

           <div className="bg-[#0F172A] p-10 rounded-[3rem] shadow-2xl text-white space-y-6 relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                <SettingsIcon size={32} className="text-blue-400 group-hover:rotate-90 transition-transform duration-700" />
                <h4 className="text-xl font-black uppercase tracking-tighter leading-none">Hỗ trợ Phụ Tá AI</h4>
                <p className="text-[10px] font-bold text-white/40 uppercase leading-relaxed italic">Sử dụng AngelBrain để phân tích dữ liệu ca viên chuyên sâu hoặc lên lịch phụng vụ tự động.</p>
                <div className="pt-4"><a href="#" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-white/10 px-6 py-3 rounded-xl hover:bg-white/20 transition-all">Truy cập AngelBrain <ChevronRight size={12} /></a></div>
              </div>
              <Cpu size={140} className="absolute -right-10 -bottom-10 opacity-5 text-white" />
           </div>
        </div>
      </div>

      {/* Floating Global Save Bar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-500">
        <button 
          onClick={handleSaveAll} 
          disabled={saveStatus !== 'idle'} 
          style={isSpring ? { backgroundColor: springPrimary } : { backgroundColor: '#0F172A' }}
          className="px-16 py-6 text-white rounded-full text-xs font-black tracking-[0.4em] uppercase shadow-2xl hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-4 border border-white/20 min-w-[320px] justify-center"
        >
          {saveStatus === 'saving' ? <Loader2 className="animate-spin" size={20} /> : saveStatus === 'success' ? <Check size={20} /> : <Save size={20} />}
          {saveStatus === 'saving' ? 'ĐANG LƯU CẤU HÌNH...' : saveStatus === 'success' ? 'ĐÃ CẬP NHẬT THÀNH CÔNG' : 'LƯU TẤT CẢ THAY ĐỔI'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
