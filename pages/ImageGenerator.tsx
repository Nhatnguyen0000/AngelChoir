
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { 
  Sparkles, Image as ImageIcon, Download, 
  Loader2, Maximize2, RefreshCw, Layers,
  Key, Info, ChevronDown
} from 'lucide-react';
import { getSpringColor } from '../store';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [hasKey, setHasKey] = useState(false);

  const springColor = getSpringColor();
  const currentTheme = localStorage.getItem('theme') || 'light';
  const isSpring = currentTheme === 'spring';

  const aspectRatios = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];

  const checkKey = async () => {
    // @ts-ignore
    const selected = await window.aistudio.hasSelectedApiKey();
    setHasKey(selected);
    if (!selected) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const generateImage = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    await checkKey();
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
            imageSize: imageSize
          }
        }
      });

      // @ts-ignore
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64 = part.inlineData.data;
          setGeneratedImageUrl(`data:image/png;base64,${base64}`);
        }
      }
    } catch (error: any) {
      if (error.message?.includes("Requested entity was not found")) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      } else {
        alert("Lỗi tạo ảnh: " + error.message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 px-4 pb-32">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/80 dark:bg-slate-900/80 rounded-[2.5rem] shadow-2xl flex items-center justify-center border border-white dark:border-slate-800">
            <ImageIcon size={40} style={{ color: springColor }} className="animate-pulse" />
          </div>
          <div>
            <h2 className={`text-4xl font-black uppercase tracking-tighter ${isSpring ? 'text-slate-800' : 'text-[#0F172A] dark:text-white'}`}>AngelVisual</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em]">Sáng tạo hình ảnh thánh ca AI (Gemini 3 Pro Image)</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="px-5 py-2.5 bg-white dark:bg-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 border border-black/5 hover:text-blue-500 flex items-center gap-2">
             <Info size={14} /> Tài liệu thanh toán
           </a>
           <button 
             // @ts-ignore
             onClick={() => window.aistudio.openSelectKey()}
             className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg"
           >
             <Key size={14} /> Đổi API Key
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[3rem] p-10 shadow-2xl border border-white dark:border-slate-800 space-y-8">
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Mô tả hình ảnh (Prompt)</label>
                 <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    placeholder="Mô tả bức ảnh bạn muốn tạo... (Vd: Bức tranh sơn dầu về một ca đoàn thiên thần đang hát dưới ánh trăng)"
                    className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border-none outline-none text-sm font-bold dark:text-white shadow-inner resize-none focus:ring-4 focus:ring-black/5 transition-all"
                 />
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Tỉ lệ khung hình</label>
                 <div className="grid grid-cols-4 gap-2">
                    {aspectRatios.map(ratio => (
                      <button 
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`py-3 rounded-xl text-[10px] font-black transition-all border ${
                          aspectRatio === ratio 
                          ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-transparent hover:border-slate-200'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Chất lượng xuất ra</label>
                 <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl">
                    {['1K', '2K', '4K'].map(size => (
                      <button 
                        key={size}
                        onClick={() => setImageSize(size as any)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          imageSize === size 
                          ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm' 
                          : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                 </div>
              </div>

              <button 
                 onClick={generateImage}
                 disabled={isGenerating || !prompt.trim()}
                 style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }}
                 className="w-full py-6 text-white rounded-full text-[12px] font-black tracking-[0.3em] uppercase shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                 {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                 {isGenerating ? 'ĐANG KHỞI TẠO...' : 'TẠO HÌNH ẢNH'}
              </button>
           </div>
        </div>

        <div className="lg:col-span-8">
           <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[4rem] p-10 border border-white dark:border-slate-800 shadow-2xl min-h-[600px] flex flex-col items-center justify-center relative overflow-hidden">
              {generatedImageUrl ? (
                <div className="w-full h-full flex flex-col items-center animate-in zoom-in-95 duration-700">
                   <div className="relative group max-w-full">
                      <img 
                        src={generatedImageUrl} 
                        alt="Generated" 
                        className="rounded-[3rem] shadow-2xl border-8 border-white dark:border-slate-800 max-w-full h-auto"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem] flex items-center justify-center gap-4">
                         <a 
                            href={generatedImageUrl} 
                            download={`AngelVisual_${Date.now()}.png`}
                            className="p-5 bg-white text-slate-900 rounded-full shadow-2xl hover:scale-110 transition-transform"
                         >
                            <Download size={24} />
                         </a>
                      </div>
                   </div>
                   <div className="mt-8 px-8 py-3 bg-white dark:bg-slate-900 rounded-full border border-black/5 shadow-xl flex items-center gap-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kích thước: {imageSize}</span>
                      <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tỉ lệ: {aspectRatio}</span>
                   </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-8 text-center opacity-30">
                   {isGenerating ? (
                     <div className="flex flex-col items-center gap-6">
                        <div className="w-32 h-32 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-inner relative">
                           <RefreshCw size={64} className="text-blue-500 animate-spin-slow" />
                        </div>
                        <div className="space-y-2">
                           <p className="text-xl font-black uppercase tracking-widest">Đang vẽ phác thảo...</p>
                           <p className="text-xs font-bold">Quá trình này có thể mất 10-30 giây tùy độ phức tạp</p>
                        </div>
                     </div>
                   ) : (
                     <>
                        <Layers size={100} strokeWidth={1} />
                        <div className="max-w-xs">
                           <p className="text-lg font-black uppercase tracking-[0.3em] mb-4">Phòng Lab Sáng Tạo</p>
                           <p className="text-xs font-bold leading-relaxed">Hãy nhập mô tả bên trái để bắt đầu tạo ra những tác phẩm nghệ thuật thánh ca tuyệt đẹp.</p>
                        </div>
                     </>
                   )}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
