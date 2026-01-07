
import React, { useState, useEffect, useMemo } from 'react';
import { Music, Plus, Search, FileText, Download, X, Edit3, Trash2, Filter, Type, User2, Tag, Link as LinkIcon, Save } from 'lucide-react';
import { getSongs, saveSongs, getSpringColor } from '../store';
import { Song } from '../types';

const Songs: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [formData, setFormData] = useState<Partial<Song>>({
    title: '',
    composer: '',
    category: 'Lễ thường',
    sheetMusicUrl: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Tất cả');

  const currentTheme = localStorage.getItem('theme') || 'light';
  const isSpring = currentTheme === 'spring';
  const springColor = getSpringColor();

  useEffect(() => {
    setSongs(getSongs());
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
    }).sort((a, b) => a.title.localeCompare(b.title));
  }, [songs, searchTerm, filterCategory]);

  const handleOpenAdd = () => {
    setEditingSong(null);
    setFormData({
      title: '',
      composer: '',
      category: 'Lễ thường',
      sheetMusicUrl: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    let updatedSongs: Song[];
    if (editingSong) {
      updatedSongs = songs.map(s => s.id === editingSong.id ? { ...s, ...formData } as Song : s);
    } else {
      const newSong: Song = {
        ...formData as Song,
        id: Date.now(),
      };
      updatedSongs = [newSong, ...songs];
    }
    setSongs(updatedSongs);
    saveSongs(updatedSongs);
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài nhạc này khỏi thư viện?')) {
      const updated = songs.filter(s => s.id !== id);
      setSongs(updated);
      saveSongs(updated);
    }
  };

  const openEdit = (song: Song) => {
    setEditingSong(song);
    setFormData(song);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-10 max-w-[1500px] mx-auto pb-24 px-4 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1 ml-4">
           <h2 className={`text-4xl font-black uppercase tracking-tighter ${isSpring ? 'text-slate-800' : 'text-[#354E4D] dark:text-white'}`}>Thư Viện Nhạc</h2>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Kho lưu trữ thánh ca hệ thống</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }}
          className="w-16 h-16 text-white rounded-[1.8rem] shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center border border-white/20"
        >
          <Plus size={32} />
        </button>
      </div>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-4 shadow-2xl flex flex-col md:flex-row items-center gap-4 border border-white dark:border-slate-800">
        <div className="relative group flex-1 max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Tìm theo tên bài hoặc nhạc sĩ..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none text-sm font-bold text-slate-600 shadow-inner dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-black/5">
           <Filter size={14} className="text-slate-400" />
           <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-[10px] font-black text-slate-500 uppercase outline-none tracking-widest cursor-pointer"
           >
              {categories.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredSongs.map(song => (
          <div key={song.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[2.5rem] p-7 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-white dark:border-slate-800 flex flex-col justify-between h-72 group relative">
            <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 z-10">
               <button onClick={() => openEdit(song)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100">
                  <Edit3 size={14} />
               </button>
               <button onClick={() => handleDelete(song.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100">
                  <Trash2 size={14} />
               </button>
            </div>
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-[#BC8F44] transition-colors shadow-inner border border-black/5">
                <Music size={26} />
              </div>
              <span className="text-[8px] font-black text-[#BC8F44] bg-[#BC8F44]/10 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-[#BC8F44]/20">
                {song.category}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1 uppercase tracking-tight line-clamp-2 leading-tight">
                {song.title}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate flex items-center gap-1.5">
                <Edit3 size={10} className="opacity-50" /> {song.composer || 'Khuyết danh'}
              </p>
            </div>
            <div className="flex gap-3 mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
              <a 
                href={song.sheetMusicUrl || '#'} 
                target="_blank" 
                rel="noreferrer"
                style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#354E4D' }} 
                className={`flex-1 py-3.5 text-white rounded-[1.2rem] text-[9px] font-black tracking-widest uppercase hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 ${!song.sheetMusicUrl ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <FileText size={14} /> BẢN NHẠC
              </a>
              <button className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-[1.2rem] hover:bg-white dark:hover:bg-slate-700 transition-all shadow-inner border border-black/5" title="Tải xuống nhanh">
                <Download size={18} />
              </button>
            </div>
          </div>
        ))}
        {filteredSongs.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center gap-4 opacity-20">
             <Music size={64} />
             <p className="text-sm font-black uppercase tracking-[0.5em]">Kho nhạc trống</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-[3rem] shadow-2xl relative border border-white/20 animate-in zoom-in-95 duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2" style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#354E4D' }}></div>
              
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg z-10">
                <X size={20} />
              </button>
              
              <div className="p-10 lg:p-12">
                <div className="flex items-center gap-4 mb-10">
                   <div style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }} className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl">
                      <Music size={28} />
                   </div>
                   <div>
                     <h3 className="text-3xl font-black uppercase tracking-tighter dark:text-white leading-none">
                        {editingSong ? 'Cập Nhật Bản Nhạc' : 'Thêm Bài Hát Mới'}
                     </h3>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Lưu trữ dữ liệu thánh ca thông minh</p>
                   </div>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                   <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <div className="flex items-center gap-2 ml-4 mb-1">
                              <Type size={12} style={isSpring ? { color: springColor } : { color: '#BC8F44' }} />
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên bài hát</label>
                           </div>
                           <input 
                             type="text" required placeholder="Ví dụ: Cao Cung Lên"
                             className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none outline-none text-sm font-bold dark:text-white shadow-inner focus:ring-2 transition-all" 
                             style={{ '--tw-ring-color': isSpring ? springColor + '30' : '#BC8F4430' } as any}
                             value={formData.title || ''} 
                             onChange={e => setFormData({...formData, title: e.target.value})}
                           />
                        </div>
                        <div className="space-y-2">
                           <div className="flex items-center gap-2 ml-4 mb-1">
                              <User2 size={12} style={isSpring ? { color: springColor } : { color: '#BC8F44' }} />
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nhạc sĩ / Tác giả</label>
                           </div>
                           <input 
                             type="text" placeholder="Tên nhạc sĩ hoặc Khuyết danh"
                             className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none outline-none text-sm font-bold dark:text-white shadow-inner focus:ring-2 transition-all" 
                             style={{ '--tw-ring-color': isSpring ? springColor + '30' : '#BC8F4430' } as any}
                             value={formData.composer || ''} 
                             onChange={e => setFormData({...formData, composer: e.target.value})}
                           />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <div className="flex items-center gap-2 ml-4 mb-1">
                               <Tag size={12} style={isSpring ? { color: springColor } : { color: '#BC8F44' }} />
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thể loại</label>
                            </div>
                            <select 
                              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none outline-none text-sm font-bold dark:text-white shadow-inner focus:ring-2 transition-all cursor-pointer appearance-none" 
                              style={{ '--tw-ring-color': isSpring ? springColor + '30' : '#BC8F4430' } as any}
                              value={formData.category || 'Lễ thường'} 
                              onChange={e => setFormData({...formData, category: e.target.value})}
                            >
                               <option value="Lễ thường">LỄ THƯỜNG</option>
                               <option value="Mùa Vọng">MÙA VỌNG</option>
                               <option value="Giáng Sinh">GIÁNG SINH</option>
                               <option value="Mùa Chay">MÙA CHAY</option>
                               <option value="Phục Sinh">PHỤC SINH</option>
                               <option value="Đức Mẹ">ĐỨC MẸ</option>
                               <option value="Thánh Tâm">THÁNH TÂM</option>
                               <option value="Khác">KHÁC</option>
                            </select>
                         </div>
                         <div className="space-y-2">
                            <div className="flex items-center gap-2 ml-4 mb-1">
                               <LinkIcon size={12} style={isSpring ? { color: springColor } : { color: '#BC8F44' }} />
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Link bản nhạc (PDF/Image)</label>
                            </div>
                            <input 
                              type="url" placeholder="https://example.com/sheet.pdf"
                              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none outline-none text-sm font-bold dark:text-white shadow-inner focus:ring-2 transition-all" 
                              style={{ '--tw-ring-color': isSpring ? springColor + '30' : '#BC8F4430' } as any}
                              value={formData.sheetMusicUrl || ''} 
                              onChange={e => setFormData({...formData, sheetMusicUrl: e.target.value})}
                            />
                         </div>
                      </div>
                   </div>

                   <div className="flex gap-4 pt-6">
                      <button 
                        type="submit" 
                        style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }} 
                        className="flex-1 py-5 text-white rounded-2xl text-xs font-black tracking-[0.3em] uppercase shadow-2xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Save size={18} />
                        {editingSong ? 'LƯU CẬP NHẬT' : 'XÁC NHẬN THÊM'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)} 
                        className="px-10 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-slate-200 transition-all"
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
