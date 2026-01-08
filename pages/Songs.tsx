
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Music, Plus, Search, FileText, Download, X, Edit3, 
  Trash2, Filter, User2, Save, Headphones, Youtube, Heart
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
      <div className="flex items-center justify-between px-2 pt-6">
        <div className="flex flex-col gap-1">
           <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Thư Viện Nhạc</h2>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Kho dữ liệu thánh ca nội bộ</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#020617' }}
          className="w-16 h-16 text-white rounded-[1.8rem] shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
        >
          <Plus size={32} />
        </button>
      </div>

      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.8rem] p-5 shadow-sm flex flex-col md:flex-row items-center gap-6 border border-black/5">
        <div className="relative group flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="Tìm bài hát, nhạc sĩ..."
            className="w-full pl-16 pr-8 py-4 bg-white dark:bg-slate-800 rounded-2xl border-none outline-none text-base font-bold shadow-inner dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
           <select 
             value={filterCategory}
             onChange={(e) => setFilterCategory(e.target.value)}
             className="px-6 py-4 bg-white dark:bg-slate-800 rounded-2xl border-none outline-none text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer shadow-sm"
           >
             {categories.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-2">
        {filteredSongs.map(song => (
          <div key={song.id} className="bg-white dark:bg-slate-900 rounded-[2.8rem] p-8 shadow-xl border border-black/5 group relative flex flex-col h-[420px] transition-all hover:-translate-y-2 hover:shadow-2xl overflow-hidden">
            <div className="h-40 bg-slate-50 dark:bg-slate-800 rounded-[2rem] mb-6 flex items-center justify-center relative overflow-hidden group-hover:bg-slate-100 transition-colors">
               <Music size={50} className="text-slate-200 dark:text-slate-700 group-hover:scale-110 transition-transform duration-500" />
               <div className="absolute top-4 left-4">
                  <span className="text-[8px] font-black bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full uppercase tracking-widest text-slate-500 shadow-sm border border-black/5">
                    {song.category}
                  </span>
               </div>
               <button 
                  onClick={() => handleToggleFavorite(song.id)}
                  className={`absolute top-4 right-4 p-2.5 rounded-2xl transition-all ${song.isFavorite ? 'bg-red-500 text-white shadow-lg' : 'bg-white/90 text-slate-300 hover:text-red-500'}`}
               >
                  <Heart size={16} fill={song.isFavorite ? 'currentColor' : 'none'} />
               </button>
               <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                  <button onClick={() => { setEditingSong(song); setFormData(song); setIsModalOpen(true); }} className="p-3 bg-white text-slate-900 rounded-xl hover:scale-110 transition-transform"><Edit3 size={18} /></button>
                  <button onClick={() => { if(window.confirm('Xóa?')) { const u = songs.filter(s => s.id !== song.id); setSongs(u); saveSongs(u); } }} className="p-3 bg-white text-red-500 rounded-xl hover:scale-110 transition-transform"><Trash2 size={18} /></button>
               </div>
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase leading-tight line-clamp-2 mb-3 tracking-tighter">{song.title}</h3>
                <div className="flex items-center gap-3">
                  <User2 size={14} className="text-slate-300" />
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest truncate">{song.composer || 'Khuyết danh'}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center gap-3">
                 <a 
                   href={song.sheetMusicUrl || '#'} target="_blank" rel="noreferrer"
                   style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#020617' }}
                   className={`flex-1 py-4 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-3 ${!song.sheetMusicUrl ? 'opacity-30 pointer-events-none' : ''}`}
                 >
                   <FileText size={16} /> Sheet PDF
                 </a>
                 <div className="flex gap-2">
                    {song.audioUrl && <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm"><Headphones size={18} /></div>}
                    {song.youtubeUrl && <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-sm"><Youtube size={18} /></div>}
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* REFINED SONG MODAL (As per screenshot) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[4rem] p-12 lg:p-16 shadow-2xl relative border border-white/20 animate-in zoom-in-95 duration-300">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:bg-red-500 hover:text-white transition-all"><X size={20} /></button>
              
              <div className="flex items-center gap-8 mb-12">
                 <div className="w-20 h-20 bg-[#0F172A] rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl">
                    <Music size={36} />
                 </div>
                 <div>
                    <h3 className="text-4xl font-black uppercase tracking-tighter dark:text-white">Thêm Bản Nhạc Mới</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 tracking-[0.3em]">Kho dữ liệu thánh ca nội bộ AngelChoir</p>
                 </div>
              </div>

              <form onSubmit={handleSave} className="space-y-10">
                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-6 tracking-widest">Tên bài hát</label>
                       <input type="text" required placeholder="Ví dụ: Cao Cung Lên" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-[1.8rem] border-none outline-none text-base font-bold dark:text-white shadow-inner" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})}/>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-6 tracking-widest">Nhạc sĩ / Tác giả</label>
                       <input type="text" placeholder="Tên nhạc sĩ hoặc Khuyết danh" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-[1.8rem] border-none outline-none text-base font-bold dark:text-white shadow-inner" value={formData.composer || ''} onChange={e => setFormData({...formData, composer: e.target.value})}/>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-6 tracking-widest">Danh mục lễ</label>
                        <select className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-[1.8rem] border-none outline-none text-sm font-bold dark:text-white shadow-inner" value={formData.category || 'Lễ thường'} onChange={e => setFormData({...formData, category: e.target.value})}>
                           {['Lễ thường', 'Mùa Vọng', 'Giáng Sinh', 'Mùa Chay', 'Phục Sinh', 'Đức Mẹ', 'Khác'].map(opt => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
                        </select>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-6 tracking-widest">Link Sheet PDF</label>
                        <input type="url" placeholder="https://drive.google.com/..." className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-[1.8rem] border-none outline-none text-base font-bold dark:text-white shadow-inner" value={formData.sheetMusicUrl || ''} onChange={e => setFormData({...formData, sheetMusicUrl: e.target.value})}/>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-6 tracking-widest">Link Audio (MP3/Drive)</label>
                        <input type="url" placeholder="Dùng để ca viên tập hát..." className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-[1.8rem] border-none outline-none text-base font-bold dark:text-white shadow-inner" value={formData.audioUrl || ''} onChange={e => setFormData({...formData, audioUrl: e.target.value})}/>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-6 tracking-widest">Link Youtube Video</label>
                        <input type="url" placeholder="Bản thu mẫu Youtube..." className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-[1.8rem] border-none outline-none text-base font-bold dark:text-white shadow-inner" value={formData.youtubeUrl || ''} onChange={e => setFormData({...formData, youtubeUrl: e.target.value})}/>
                     </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                     <button type="submit" className="flex-1 py-7 bg-[#0F172A] text-white rounded-full text-[13px] font-black tracking-[0.4em] uppercase shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-4 active:scale-95">
                        <Save size={24} /> XÁC NHẬN LƯU TRỮ
                     </button>
                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-7 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">ĐÓNG</button>
                  </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Songs;
