
import React, { useState, useRef } from 'react';
import { 
  Camera, User, Palette, Database, Trash2, 
  Save, Sparkles, Download, 
  Upload, ShieldCheck, BellRing, Check,
  Cpu, HardDrive, Info, Loader2, RefreshCw,
  Server, Fingerprint, Music, AlertTriangle
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

  const handleSaveAll = () => {
    setSaveStatus('saving');
    try {
      updateUserProfile(fullName, avatarPreview);
      saveNotice(notice);
      saveSpringColor(springPrimary);
      
      setTimeout(() => {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
        window.dispatchEvent(new Event('storage'));
      }, 1000);
    } catch (error) {
      console.error('System Update Error:', error);
      setSaveStatus('idle');
      alert('Lỗi hệ thống khi cập nhật. Vui lòng thử lại.');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const success = importSystemData(ev.target?.result as string);
        if (success) {
           alert('Dữ liệu đã được khôi phục thành công! Hệ thống sẽ khởi động lại.');
           window.location.reload();
        } else {
           alert('Lỗi khôi phục: Tệp dữ liệu không hợp lệ.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-[1500px] mx-auto space-y-8 animate-in fade-in duration-700 pb-40 px-4">
      
      {/* Settings Navigation Bar */}
      <div className="flex bg-white/60 dark:bg-slate-900/60 p-2 rounded-[2.2rem] border border-black/5 shadow-xl backdrop-blur-2xl w-fit mx-auto lg:mx-0">
        {[
          { id: 'profile', label: 'Hồ sơ Quản trị', icon: User }, 
          { id: 'system', label: 'Hệ thống & Theme', icon: Palette }, 
          { id: 'advanced', label: 'Trung tâm Dữ liệu', icon: Server }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveSettingsTab(tab.id as any)} 
            className={`px-10 py-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeSettingsTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          {activeSettingsTab === 'profile' && (
            <div className="bg-white/90 dark:bg-slate-900/90 rounded-[3rem] p-12 shadow-2xl border border-white dark:border-slate-800 space-y-12 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 border-b border-slate-50 dark:border-slate-800 pb-6">
                 <User className="text-amber-600" size={24} />
                 <h3 className="text-2xl font-black uppercase tracking-tighter dark:text-white">Cấu hình hồ sơ quản trị</h3>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="relative group">
                  <div className="w-48 h-48 rounded-[3.8rem] bg-slate-50 dark:bg-slate-800 overflow-hidden border-4 border-white dark:border-slate-700 shadow-2xl relative">
                    {avatarPreview ? (
                      <img src={avatarPreview} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-100 dark:bg-slate-800">
                        <User size={90} strokeWidth={1} />
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="absolute -bottom-2 -right-2 w-14 h-14 bg-[#0f172a] text-white rounded-[1.8rem] flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-900 hover:scale-110 transition-transform"
                  >
                    <Camera size={24} />
                  </button>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload = (ev) => setAvatarPreview(ev.target?.result as string); r.readAsDataURL(f); } }} />
                </div>
                
                <div className="flex-1 space-y-8 w-full">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Họ và Tên Quản Trị</label>
                      <input type="text" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border-none font-bold text-xl shadow-inner outline-none focus:ring-4 focus:ring-blue-500/10 transition-all dark:text-white" value={fullName} onChange={e => setFullName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-black/5 shadow-sm">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Mã quản trị</p>
                          <p className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2"><Fingerprint size={16} className="text-amber-600" /> ADM-888-AC</p>
                       </div>
                       <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-black/5 shadow-sm">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Quyền truy cập</p>
                          <p className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-500" /> FULL ACCESS</p>
                       </div>
                    </div>
                </div>
              </div>
            </div>
          )}

          {activeSettingsTab === 'system' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white/90 dark:bg-slate-900/90 rounded-[3rem] p-10 shadow-xl border border-white dark:border-slate-800 space-y-8">
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-6">
                     <h4 className="text-xl font-black uppercase tracking-tighter dark:text-white flex items-center gap-3"><Palette className="text-amber-600" /> Tùy chỉnh theme 'Spring'</h4>
                     <button onClick={() => setSpringPrimary('#0f172a')} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">Đặt lại Navy</button>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-10 bg-slate-50 dark:bg-slate-950/50 p-10 rounded-[2.8rem] border border-black/5 shadow-inner">
                    <div className="relative group">
                      <input type="color" value={springPrimary} onChange={e => setSpringPrimary(e.target.value)} className="w-32 h-32 bg-transparent border-none cursor-pointer p-0 opacity-0 absolute inset-0 z-20" />
                      <div className="w-32 h-32 rounded-[2rem] shadow-2xl border-4 border-white dark:border-slate-700 group-hover:scale-105 transition-transform" style={{ backgroundColor: springPrimary }}></div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-20"><RefreshCw className="text-white" size={40} /></div>
                    </div>
                    <div className="flex-1 space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Mã màu chủ đạo (Primary Hex)</label>
                       <div className="relative">
                          <input type="text" value={springPrimary.toUpperCase()} onChange={e => setSpringPrimary(e.target.value)} className="w-full px-10 py-5 bg-white dark:bg-slate-800 rounded-2xl font-mono font-bold text-xl border-none shadow-sm dark:text-white uppercase" />
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg border border-black/5 shadow-inner" style={{ backgroundColor: springPrimary }}></div>
                       </div>
                    </div>
                  </div>
              </div>

              <div className="bg-white/90 dark:bg-slate-900/90 rounded-[3rem] p-10 shadow-xl border border-white dark:border-slate-800 space-y-8">
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-6">
                    <h4 className="text-xl font-black uppercase tracking-tighter dark:text-white flex items-center gap-3"><BellRing className="text-amber-500" /> Thông báo Dashboard</h4>
                    <label className="flex items-center gap-3 cursor-pointer">
                       <div className={`w-14 h-8 rounded-full p-1 transition-all ${notice.isVisible ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                          <input type="checkbox" className="hidden" checked={notice.isVisible} onChange={e => setNotice({...notice, isVisible: e.target.checked})} />
                          <div className={`w-6 h-6 bg-white rounded-full transition-transform ${notice.isVisible ? 'translate-x-6' : 'translate-x-0'}`}></div>
                       </div>
                    </label>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Tiêu đề thông báo</label>
                       <input type="text" className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm shadow-inner dark:text-white" value={notice.title} onChange={e => setNotice({...notice, title: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nội dung chi tiết</label>
                       <textarea rows={2} className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm shadow-inner resize-none dark:text-white" value={notice.content} onChange={e => setNotice({...notice, content: e.target.value})} />
                    </div>
                  </div>
              </div>
            </div>
          )}

          {activeSettingsTab === 'advanced' && (
            <div className="bg-white/90 dark:bg-slate-900/90 rounded-[3rem] p-10 shadow-xl border border-white dark:border-slate-800 space-y-10 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-6">
                  <h4 className="text-xl font-black uppercase tracking-tighter dark:text-white flex items-center gap-3"><Database className="text-blue-500" /> Trung tâm Dữ liệu</h4>
              </div>
                
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[3rem] space-y-6 border border-black/5 hover:border-blue-400 transition-colors group text-center">
                    <Download className="text-blue-500 mx-auto group-hover:scale-110 transition-transform" size={40} />
                    <div>
                      <h5 className="text-sm font-black uppercase dark:text-white mb-2">Tải bản sao lưu</h5>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Xuất toàn bộ cơ sở dữ liệu hệ thống.</p>
                    </div>
                    <button onClick={exportSystemData} className="w-full py-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-slate-900 hover:text-white transition-all">Download JSON</button>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[3rem] space-y-6 border border-black/5 hover:border-emerald-400 transition-colors group text-center">
                    <Upload className="text-emerald-500 mx-auto group-hover:scale-110 transition-transform" size={40} />
                    <div>
                      <h5 className="text-sm font-black uppercase dark:text-white mb-2">Khôi phục hồ sơ</h5>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight italic">Thao tác này sẽ ghi đè dữ liệu hiện tại.</p>
                    </div>
                    <label className="w-full py-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-md flex items-center justify-center cursor-pointer hover:bg-emerald-600 hover:text-white transition-all">
                      Nạp File Backup
                      <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                    </label>
                  </div>
              </div>

              <div className="p-8 bg-red-50 dark:bg-red-900/10 rounded-[2.8rem] border border-red-100 flex items-center gap-8 group">
                   <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center text-red-600 shrink-0 group-hover:animate-shake"><AlertTriangle size={32} /></div>
                   <div className="flex-1">
                      <h5 className="text-sm font-black uppercase text-red-700 dark:text-red-400 mb-1">Xóa vĩnh viễn dữ liệu</h5>
                      <p className="text-[10px] font-bold text-red-600/60 uppercase tracking-widest italic leading-relaxed">Mọi hồ sơ ca viên và lịch trình sẽ bị xóa sạch.</p>
                   </div>
                   <button onClick={() => { if(window.confirm('CẢNH BÁO: Hành động này không thể hoàn tác! Bạn có chắc chắn?')) { localStorage.clear(); window.location.reload(); } }} className="px-8 py-5 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-red-800 transition-all">Factory Reset</button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white/90 dark:bg-slate-900/90 rounded-[3rem] p-10 shadow-xl border border-white dark:border-slate-800 space-y-10">
              <div className="flex items-center gap-5 border-b border-slate-50 dark:border-slate-800 pb-8">
                 <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner"><Cpu size={28} /></div>
                 <div>
                    <h4 className="text-sm font-black uppercase dark:text-white leading-none mb-2">Trạng thái Engine</h4>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">HỆ THỐNG ỔN ĐỊNH</p>
                 </div>
              </div>

              <div className="space-y-5">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Version</span>
                    <span className="text-xs font-black text-slate-800 dark:text-white">v5.8.2-AngelCore</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Database</span>
                    <span className="text-xs font-black text-slate-800 dark:text-white">AngelCloud Engine</span>
                 </div>
              </div>
           </div>

           <div className="bg-[#0f172a] rounded-[3rem] p-10 shadow-2xl text-white space-y-6 relative overflow-hidden group text-center">
              <Music size={100} className="absolute -right-5 -bottom-5 opacity-5 rotate-12 group-hover:scale-110 transition-transform" />
              <div className="relative z-10 space-y-4">
                 <h4 className="text-lg font-black uppercase tracking-tighter flex items-center justify-center gap-3"><Info size={20} className="text-amber-500" /> AngelChoir Suite</h4>
                 <p className="text-[11px] font-bold text-white/50 leading-relaxed italic uppercase tracking-wider">Giải pháp quản trị phụng vụ ca đoàn chuyên nghiệp.</p>
              </div>
           </div>
        </div>
      </div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={handleSaveAll} 
          disabled={saveStatus !== 'idle'} 
          style={{ backgroundColor: isSpring ? springPrimary : '#0f172a' }}
          className="px-24 py-7 text-white rounded-full text-[14px] font-black tracking-[0.4em] uppercase shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-4 border border-white/20 min-w-[400px] justify-center"
        >
          {saveStatus === 'saving' ? <Loader2 className="animate-spin" size={24} /> : saveStatus === 'success' ? <Check size={24} strokeWidth={5} /> : <Save size={24} />}
          {saveStatus === 'saving' ? 'ĐANG ĐỒNG BỘ...' : saveStatus === 'success' ? 'CẬP NHẬT THÀNH CÔNG' : 'LƯU TẤT CẢ THAY ĐỔI'}
        </button>
      </div>
    </div>
  );
};

export default Settings;