
import React, { useState, useEffect } from 'react';
import { Music, Plus, Search, FileText, Download } from 'lucide-react';
import { getSongs } from '../store';
import { Song } from '../types';

const Songs: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    setSongs(getSongs());
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-xl font-extrabold text-[#354E4D] uppercase tracking-wider">THÁNH CA ({songs.length})</h2>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-[#BC8F44] text-white rounded-full text-[10px] font-black tracking-widest shadow-lg shadow-[#BC8F44]/20">
          THÊM BÀI HÁT <Plus size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {songs.map(song => (
          <div key={song.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all border border-white flex flex-col justify-between h-56">
            <div className="flex items-start justify-between">
              <div className="p-4 bg-[#F1F5F9] rounded-2xl text-[#354E4D]">
                <Music size={20} />
              </div>
              <span className="text-[9px] font-black text-[#BC8F44] bg-[#BC8F44]/10 px-3 py-1 rounded-full uppercase tracking-widest">{song.category}</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-[#354E4D] mb-1 leading-tight">{song.title}</h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{song.composer}</p>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#354E4D] text-white rounded-full text-[10px] font-black tracking-widest uppercase">
                XEM BẢN NHẠC <FileText size={14} />
              </button>
              <button className="w-12 h-12 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-all">
                <Download size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Songs;
