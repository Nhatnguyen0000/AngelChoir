
import React, { useState, useEffect } from 'react';
import { Music, Plus, Search, FileText, Download } from 'lucide-react';
import { getSongs, getSpringColor } from '../store';
import { Song } from '../types';

const Songs: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const currentTheme = localStorage.getItem('theme') || 'light';
  const isSpring = currentTheme === 'spring';
  const springColor = getSpringColor();

  useEffect(() => {
    setSongs(getSongs());
  }, []);

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-16">
      <div className="flex items-center justify-between px-4">
        <h2 className={`text-2xl font-black uppercase tracking-tighter ${isSpring ? 'text-slate-800' : 'text-[#354E4D] dark:text-white'}`}>THÁNH CA ({songs.length})</h2>
        <button 
          style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#BC8F44' }}
          className="flex items-center gap-2 px-7 py-3 text-white rounded-full text-[9px] font-black tracking-widest shadow-lg hover:scale-105 transition-all"
        >
          THÊM BÀI HÁT <Plus size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
        {songs.map(song => (
          <div key={song.id} className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-5 shadow-md hover:shadow-xl transition-all border border-white dark:border-slate-800 flex flex-col justify-between h-44 group">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-[#BC8F44] transition-colors">
                <Music size={18} />
              </div>
              <span className="text-[7px] font-black text-[#BC8F44] bg-[#BC8F44]/10 px-2 py-0.5 rounded-md uppercase tracking-widest">{song.category}</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-[#354E4D] dark:text-white mb-0.5 leading-tight uppercase line-clamp-1">{song.title}</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">{song.composer}</p>
            </div>
            <div className="flex gap-2">
              <button style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#354E4D' }} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-white rounded-xl text-[8px] font-black tracking-widest uppercase hover:opacity-90 transition-all">
                XEM BẢN NHẠC <FileText size={12} />
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
                <Download size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Songs;
