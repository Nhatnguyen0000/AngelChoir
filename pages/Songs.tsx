
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Music, Plus, Search, FileText, Download, X, Edit3, 
  Trash2, Filter, Type, User2, Tag, Link as LinkIcon, 
  Save, Play, Heart, Headphones, Youtube, Share2, MoreVertical
} from 'lucide-react';
import { getSongs, saveSongs, getSpringColor } from '../store';
import { Song } from '../types';

interface AdvancedSong extends Song {
  audioUrl?: string;
  youtubeUrl?: string;
  isFavorite?: boolean;
  tags?: string[];
}

const Songs: React.FC = () => {
  const [songs, setSongs] = useState<AdvancedSong[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<AdvancedSong | null>(null);
  const [formData, setFormData] = useState<Partial<AdvancedSong>>({
    title: '',
    composer: '',
    category: 'Lễ thường',
    sheetMusicUrl: '',
    audioUrl: '',
    youtubeUrl: '',
    tags: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Tất cả');

  const springColor = getSpringColor();
  const currentTheme = localStorage.getItem('theme') || 'light';
  const isSpring = currentTheme === 'spring';

  useEffect(() => {
    const data = getSongs() as AdvancedSong[];
    setSongs(data);
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(songs.map(s => s.category));
    return ['Tất cả', ...Array.from(cats)];
  }, [songs]);

  const filteredSongs = useMemo(() => {
    return songs.filter(s => {
      const matchSearch = (s.title + s.composer).toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = filterCategory === 'Tất cả' || s.category === filterCategory;
      return matchSearch && matchCat;
    }).sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return a.title.localeCompare(b.title);
    });
  }, [songs, searchTerm, filterCategory]);

  const handleToggleFavorite = (id: number) => {
    const updated = songs.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s);
    setSongs(updated);
    saveSongs(updated);
  };

  const handleOpenAdd = () => {
    setEditingSong(null);
    setFormData({ title: '', composer: '', category: 'Lễ thường', sheetMusicUrl: '', audioUrl: '', youtubeUrl: '', tags: [] });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    let updatedSongs: AdvancedSong[];
    if (editingSong) {
      updatedSongs = songs.map(s => s.id === editingSong.id ? { ...s, ...formData } as AdvancedSong : s);
    } else {
      const newSong: AdvancedSong = { ...formData as AdvancedSong, id: Date.now(), isFavorite: false };
      updatedSongs = [newSong, ...songs];
    }
    setSongs(updatedSongs);
    saveSongs(updatedSongs);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto pb-32 px-4 animate-in fade-in duration-700">
      <div className="flex items-center justify-between px-4">
        <div className="flex flex-col gap-1">
           <h2 className={`text-4xl font-black uppercase tracking-tighter ${isSpring ? 'text-slate-800' : 'text-[#354E4D] dark:text-white'}`}>Thư Viện Nhạc</h2>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Hệ thống lưu trữ & Luyện tập ca đoàn</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }}
          className="w-16 h-16 text-white rounded-[1.8rem] shadow-2xl hover:scale-110 transition-all flex items-center justify-center border border-white/20"
        >
          <Plus size={32} />
        </button>
      </div>

      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.8rem] p-5 shadow-2xl flex flex-col md:flex-row items-center gap-6 border border-white dark:border-slate-800">
        <div className="relative group flex-1 max-w-xl w-full">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Tìm bài hát, nhạc sĩ hoặc từ khóa..."
            className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-800 rounded-[2rem] border-none outline-none text-base font-bold text-slate-700 shadow-inner dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-[1.8rem] border border-black/5">
           <div className="px-6 py-3 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center gap-3">
              <Filter size={16} className="text-slate-400" />
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-transparent text-[11px] font-black text-slate-600 dark:text-slate-200 uppercase outline-none tracking-widest cursor-pointer"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
              </select>
           </div>
           <div className="h-8 w-px bg-slate-100 hidden sm:block"></div>
           <button className="p-3 text-slate-400 hover:text-red-500 transition-colors"><Heart size={20} /></button>
        </div>
      </div>

      {/* Grid of Advanced Song Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-2">
        {filteredSongs.map(song => (
          <div key={song.id} className="bg-white dark:bg-slate-900 rounded-[2.8rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800 group relative flex flex-col h-[400px] transition-all hover:-translate-y-2 hover:shadow-2xl overflow-hidden">
            
            {/* Visual Cover Section */}
            <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-[2rem] mb-6 flex flex-col items-center justify-center relative overflow-hidden group-hover:from-blue-50 group-hover:to-blue-100 transition-colors">
               <Music size={50} className="text-slate-300 dark:text-slate-700 group-hover:text-blue-300 group-hover:scale-110 transition-all duration-500" />
               
               <div className="absolute top-4 left-4">
                  <span className="text-[8px] font-black bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-full uppercase tracking-widest text-slate-500 shadow-sm border border-black/5">
                    {song.category}
                  </span>
               </div>

               <button 
                  onClick={() => handleToggleFavorite(song.id)}
                  className={`absolute top-4 right-4 p-2.5 rounded-2xl backdrop-blur-md transition-all ${song.isFavorite ? 'bg-red-500 text-white shadow-lg' : 'bg-white/90 text-slate-300 hover:text-red-500'}`}
               >
                  <Heart size={16} fill={song.isFavorite ? 'currentColor' : 'none'} />
               </button>

               {/* Hidden Quick Action Layer */}
               <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                  <button onClick={() => { setEditingSong(song); setFormData(song); setIsModalOpen(true); }} className="w-12 h-12 bg-white text-slate-900 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform"><Edit3 size={20} /></button>
                  <button onClick={() => { if(window.confirm('Xóa bản nhạc?')) { const u = songs.filter(s => s.id !== song.id); setSongs(u); saveSongs(u); } }} className="w-12 h-12 bg-white text-red-500 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform"><Trash2 size={20} /></button>
               </div>
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase leading-tight line-clamp-2 mb-3 tracking-tighter" title={song.title}>
                  {song.title}
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                    <User2 size={14} />
                  </div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest truncate">
                    {song.composer || 'Khuyết danh'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center gap-3">
                 <a 
                   href={song.sheetMusicUrl || '#'} target="_blank" rel="noreferrer"
                   style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }}
                   className={`flex-1 py-4 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-3 ${!song.sheetMusicUrl ? 'opacity-30 pointer-events-none' : ''}`}
                 >
                   <FileText size={16} /> Sheet PDF
                 </a>
                 <div className="flex gap-2">
                    {song.audioUrl && (
                      <button className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                        <Headphones size={18} />
                      </button>
                    )}
                    {song.youtubeUrl && (
                      <button className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm">
                        <Youtube size={18} />
                      </button>
                    )}
                 </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Artistic Add New Button */}
        <button onClick={handleOpenAdd} className="rounded-[2.8rem] border-4 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-5 text-slate-300 hover:border-blue-400 hover:text-blue-400 transition-all min-h-[400px] group">
           <div className="w-20 h-20 rounded-[2rem] border-4 border-dashed border-inherit flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={40} />
           </div>
           <span className="text-[11px] font-black uppercase tracking-[0.3em]">Bổ sung thư viện</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-950 w-full max-w-3xl rounded-[4rem] shadow-2xl relative border border-white/20 animate-in zoom-in-95 duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2.5" style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }}></div>
              <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-[1.8rem] hover:bg-red-500 hover:text-white transition-all shadow-lg z-10"><X size={26} /></button>
              
              <div className="p-12 lg:p-16">
                <div className="flex items-center gap-6 mb-12">
                   <div style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }} className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl">
                      <Music size={32} />
                   </div>
                   <div>
                     <h3 className="text-3xl font-black uppercase tracking-tighter dark:text-white leading-none">
                        {editingSong ? 'Cập Nhật Bản Nhạc' : 'Thêm Bản Nhạc Mới'}
                     </h3>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 tracking-[0.2em]">Kho dữ liệu thánh ca nội bộ AngelChoir</p>
                   </div>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Tên bài hát</label>
                           <input type="text" required placeholder="Ví dụ: Cao Cung Lên" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 rounded-[1.8rem] border-none outline-none text-base font-bold dark:text-white shadow-inner" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})}/>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Nhạc sĩ / Tác giả</label>
                           <input type="text" placeholder="Tên nhạc sĩ hoặc Khuyết danh" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 rounded-[1.8rem] border-none outline-none text-base font-bold dark:text-white shadow-inner" value={formData.composer || ''} onChange={e => setFormData({...formData, composer: e.target.value})}/>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Danh mục lễ</label>
                            <select className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 rounded-[1.8rem] border-none outline-none text-base font-bold dark:text-white shadow-inner cursor-pointer" value={formData.category || 'Lễ thường'} onChange={e => setFormData({...formData, category: e.target.value})}>
                               {['Lễ thường', 'Mùa Vọng', 'Giáng Sinh', 'Mùa Chay', 'Phục Sinh', 'Đức Mẹ', 'Thánh Tâm', 'Khác'].map(opt => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
                            </select>
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Link Sheet PDF</label>
                            <input type="url" placeholder="https://drive.google.com/..." className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 rounded-[1.8rem] border-none outline-none text-base font-bold dark:text-white shadow-inner" value={formData.sheetMusicUrl || ''} onChange={e => setFormData({...formData, sheetMusicUrl: e.target.value})}/>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Link Audio (MP3/Drive)</label>
                            <input type="url" placeholder="Dùng để ca viên tập hát..." className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 rounded-[1.8rem] border-none outline-none text-base font-bold dark:text-white shadow-inner" value={formData.audioUrl || ''} onChange={e => setFormData({...formData, audioUrl: e.target.value})}/>
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Link Youtube Video</label>
                            <input type="url" placeholder="Bản thu mẫu Youtube..." className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 rounded-[1.8rem] border-none outline-none text-base font-bold dark:text-white shadow-inner" value={formData.youtubeUrl || ''} onChange={e => setFormData({...formData, youtubeUrl: e.target.value})}/>
                         </div>
                      </div>

                   <div className="flex gap-4 pt-8 border-t border-slate-50 dark:border-slate-800">
                      <button 
                        type="submit" 
                        style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }} 
                        className="flex-1 py-6 text-white rounded-[2rem] text-sm font-black tracking-[0.4em] uppercase shadow-2xl hover:opacity-90 transition-all flex items-center justify-center gap-4 active:scale-95"
                      >
                        <Save size={24} /> {editingSong ? 'CẬP NHẬT DỮ LIỆU' : 'XÁC NHẬN LƯU TRỮ'}
                      </button>
                      <button 
                        type="button" onClick={() => setIsModalOpen(false)} 
                        className="px-12 py-6 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-[2rem] text-[11px] font-black tracking-widest uppercase hover:bg-slate-200 transition-all"
                      >
                        ĐÓNG
                      </button>
                   </div>
                </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Songs;
