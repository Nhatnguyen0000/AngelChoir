
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { 
  Send, Globe, Loader2, Sparkles, 
  BrainCircuit, ExternalLink, 
  Zap, Search, BookOpen
} from 'lucide-react';
import { getSpringColor, getMembers, getTransactions } from '../store';
import { Message } from '../types';

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [mode, setMode] = useState<'pro' | 'flash'>('flash');
  const scrollRef = useRef<HTMLDivElement>(null);

  const springColor = getSpringColor();
  const currentTheme = localStorage.getItem('theme') || 'light';
  const isSpring = currentTheme === 'spring';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = async () => {
    const textInput = input.trim();
    if (!textInput || isThinking) return;

    const userMsg: Message = { role: 'user', content: textInput, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemInstruction = `
        Bạn là AngelBrain v5.0 - Trí tuệ Nhân tạo Phụng vụ cao cấp cho ca đoàn AngelChoir.
        Dữ liệu hệ thống thực tế:
        - Danh sách ca viên: ${JSON.stringify(getMembers())}
        - Lịch sử tài chính: ${JSON.stringify(getTransactions())}
        
        Nhiệm vụ chính:
        1. Phân tích dữ liệu nội bộ để đưa ra báo cáo, dự báo chi tiêu hoặc đề xuất tập hát.
        2. Truy vấn Internet để tìm kiếm lời bài hát, thông tin phụng vụ, các bài đọc Tin Mừng mới nhất bằng Search Grounding.
        3. Tư vấn kỹ thuật thanh nhạc và phối khí chuyên sâu.
        
        Sử dụng tiếng Việt chuyên nghiệp, tinh tế, đúng tinh thần phụng vụ Công giáo.
      `;

      if (mode === 'flash') {
        // Search Grounding Mode using gemini-3-flash-preview
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{ parts: [{ text: textInput }] }],
          config: { 
            systemInstruction,
            tools: [{ googleSearch: {} }] 
          }
        });
        
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
          title: String(chunk.web?.title || "Nguồn Phụng Vụ"),
          uri: String(chunk.web?.uri || "#")
        })) || [];

        setMessages(prev => [...prev, { 
          role: 'model', 
          content: String(response.text || "Yêu cầu của bạn đang được xử lý, nhưng hệ thống chưa tìm thấy dữ liệu phù hợp."),
          sources: sources,
          timestamp: Date.now() 
        }]);
      } else {
        // Deep Reasoning Mode using gemini-3-pro-preview
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: [{ parts: [{ text: textInput }] }],
          config: { 
            systemInstruction,
            thinkingConfig: { thinkingBudget: 32768 } 
          }
        });

        setMessages(prev => [...prev, { 
          role: 'model', 
          content: String(response.text || "Phân tích tư duy đã hoàn tất."), 
          timestamp: Date.now() 
        }]);
      }
    } catch (error: any) {
      console.error('AI Assistant Error:', error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: `Cảnh báo hệ thống: Mất kết nối với Trung tâm AngelBrain (${error.message || "Lỗi giao thức"}).`, 
        timestamp: Date.now() 
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto pb-12 gap-8 animate-in fade-in duration-1000">
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <div className="w-24 h-24 bg-white/80 dark:bg-slate-900/80 rounded-[2.5rem] shadow-2xl flex items-center justify-center border border-white dark:border-slate-800">
            <BrainCircuit size={48} style={{ color: springColor }} className="animate-pulse" />
          </div>
          <div>
            <h2 className={`text-5xl font-black uppercase tracking-tighter ${isSpring ? 'text-slate-800' : 'text-[#1E1E1E] dark:text-white'}`}>AngelBrain</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em]">Kích hoạt truy vấn thông minh v5.0</p>
            </div>
          </div>
        </div>
        <div className="flex items-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-2 rounded-[2.2rem] border border-black/5 shadow-2xl">
           <button 
             onClick={() => setMode('pro')} 
             className={`px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${mode === 'pro' ? 'bg-[#1E1E1E] text-white shadow-2xl scale-105' : 'text-slate-400 hover:text-slate-800'}`}
           >
             <Zap size={14} /> Tư Duy Sâu
           </button>
           <button 
             onClick={() => setMode('flash')} 
             className={`px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${mode === 'flash' ? 'bg-[#1E1E1E] text-white shadow-2xl scale-105' : 'text-slate-400 hover:text-slate-800'}`}
           >
             <Globe size={14} /> Tìm Kiếm Toàn Cầu
           </button>
        </div>
      </div>

      <div className="flex-1 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-white/50 dark:border-slate-800 flex flex-col overflow-hidden relative">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 lg:p-16 space-y-12 no-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-12 opacity-60">
              <div className="w-36 h-36 bg-white dark:bg-slate-800 rounded-[3rem] flex items-center justify-center shadow-2xl border border-white dark:border-slate-700">
                <Search size={72} className="text-[#BC8F44]" strokeWidth={1} />
              </div>
              <div className="max-w-md">
                <p className="text-[13px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 leading-loose">Khởi tạo trung tâm AngelBrain Cloud</p>
                <div className="grid grid-cols-1 gap-5">
                  {[
                    "Lời bài hát 'Đêm hồng ân'?",
                    "Các bài đọc Tin Mừng hôm nay?",
                    "Phân tích tài chính ca đoàn tháng này?",
                    "Tư vấn kỹ thuật cộng thanh cho bè Bass?"
                  ].map((suggestion, idx) => (
                    <button key={idx} onClick={() => setInput(suggestion)} className="p-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-[2.5rem] text-[11px] font-black text-slate-600 dark:text-slate-200 hover:bg-white transition-all border border-black/5 shadow-xl text-left flex items-center gap-5 group hover:scale-[1.02]">
                      <BookOpen size={18} className="text-[#BC8F44] group-hover:rotate-6 transition-transform" /> {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-8 duration-700`}>
              <div className={`max-w-[85%] rounded-[3rem] p-12 lg:p-14 shadow-2xl border border-white/50 ${
                msg.role === 'user' 
                ? 'bg-[#1E1E1E] text-white' 
                : 'bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 backdrop-blur-2xl border-white/30 dark:border-slate-800'
              }`}
              style={msg.role === 'user' && isSpring ? { backgroundColor: springColor } : {}}>
                <div className="whitespace-pre-wrap text-[15px] leading-[1.8] font-semibold tracking-tight">
                  {String(msg.content)}
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-3">
                       <Globe size={14} /> Tham chiếu dữ liệu trực tuyến (Grounding)
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {msg.sources.map((s, idx) => (
                        <a key={idx} href={String(s.uri)} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[11px] font-black text-blue-700 hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-50">
                          <ExternalLink size={14} /> {String(s.title)}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isThinking && (
            <div className="flex justify-start">
               <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl rounded-[3rem] p-12 flex flex-col gap-8 min-w-[400px] border border-white dark:border-slate-800 shadow-2xl">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Loader2 size={36} className="animate-spin text-red-800" />
                      <BrainCircuit size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <span className="text-[13px] font-black uppercase tracking-[0.3em] text-slate-700 dark:text-slate-200">
                      {mode === 'pro' ? 'AngelBrain đang tư duy sâu...' : 'Đang tìm kiếm thông tin phụng vụ...'}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner p-0.5">
                       <div className="h-full bg-gradient-to-r from-red-900 to-[#BC8F44] w-1/2 animate-progress rounded-full"></div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] italic text-center">Hệ thống xử lý đám mây AngelCore</p>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="p-12 lg:p-14 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-t border-white/50 dark:border-slate-800">
          <div className="relative max-w-4xl mx-auto">
            <textarea 
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Bạn cần AngelBrain hỗ trợ gì hôm nay?"
              className="w-full pl-10 pr-32 py-8 bg-white dark:bg-slate-950 rounded-[2.8rem] border-none !border-transparent outline-none text-lg font-bold shadow-2xl focus:ring-12 focus:ring-black/5 transition-all resize-none overflow-hidden placeholder:text-slate-300 placeholder:font-black placeholder:uppercase placeholder:text-[12px] placeholder:tracking-[0.2em]"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#1E1E1E' }}
              className="absolute right-4 top-4 w-16 h-16 flex items-center justify-center text-white rounded-[1.8rem] shadow-2xl hover:scale-[1.08] active:scale-90 disabled:opacity-30 transition-all border border-white/20"
            >
              <Send size={32} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
