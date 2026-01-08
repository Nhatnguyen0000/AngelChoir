
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { 
  Send, Globe, Loader2, Sparkles, 
  BrainCircuit, ExternalLink, 
  Zap
} from 'lucide-react';
import { getSpringColor, getMembers, getTransactions } from '../store';
import { Message } from '../types';

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [mode, setMode] = useState<'pro' | 'flash'>('pro');
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
        Bạn là AngelBrain v3.0 - Hệ thống Trí tuệ Nhân tạo tối cao cho ca đoàn AngelChoir.
        Dữ liệu thực tế hiện tại:
        - Thành viên: ${JSON.stringify(getMembers())}
        - Tài chính: ${JSON.stringify(getTransactions())}
        Nhiệm vụ: Phân tích, tư vấn âm nhạc, lập kế hoạch phụng vụ.
        Khi dùng 'flash', hãy tìm kiếm thông tin phụng vụ, bài hát và lời Chúa chính xác.
        Phản hồi bằng tiếng Việt chuyên nghiệp, tinh tế.
      `;

      if (mode === 'flash') {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{ parts: [{ text: textInput }] }],
          config: { 
            systemInstruction,
            tools: [{ googleSearch: {} }] 
          }
        });
        
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
          title: String(chunk.web?.title || "Nguồn dữ liệu"),
          uri: String(chunk.web?.uri || "#")
        })) || [];

        setMessages(prev => [...prev, { 
          role: 'model', 
          content: String(response.text || "Yêu cầu của bạn đang được xử lý, nhưng tôi chưa tìm thấy kết quả phù hợp."),
          sources: sources,
          timestamp: Date.now() 
        }]);
      } else {
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
          content: String(response.text || "Phân tích chuyên sâu đã hoàn tất."), 
          timestamp: Date.now() 
        }]);
      }
    } catch (error: any) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: `Mất kết nối với Trung tâm AngelBrain: ${error.message || "Lỗi không xác định"}.`, 
        timestamp: Date.now() 
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto pb-10 gap-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/80 dark:bg-slate-900/80 rounded-[2rem] shadow-2xl flex items-center justify-center border border-white dark:border-slate-800">
            <BrainCircuit size={40} style={{ color: springColor }} className="animate-pulse" />
          </div>
          <div>
            <h2 className={`text-4xl font-black uppercase tracking-tighter ${isSpring ? 'text-slate-800' : 'text-[#0F172A] dark:text-white'}`}>AngelBrain</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em]">Trí Tuệ Nhân Tạo Hệ Thống Đang Trực Tuyến</p>
            </div>
          </div>
        </div>
        <div className="flex items-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-2 rounded-[2rem] border border-black/5 shadow-xl">
           <button onClick={() => setMode('pro')} className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'pro' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400'}`}>Tư Duy Phức Hợp</button>
           <button onClick={() => setMode('flash')} className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'flash' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400'}`}>Truy Xuất Phụng Vụ</button>
        </div>
      </div>

      <div className="flex-1 bg-white/30 dark:bg-slate-900/30 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white/40 dark:border-slate-800 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-10 no-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-10">
              <div className="w-32 h-32 bg-white dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white dark:border-slate-700 animate-bounce">
                <Zap size={64} className="text-amber-400" />
              </div>
              <div className="max-w-md">
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Khởi Tạo Trung Tâm AngelBrain</p>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    "Phân tích tài chính tháng này và dự báo chi phí quý tới.",
                    "Tìm thông tin các bài hát phù hợp cho Lễ Giáng Sinh.",
                    "Đề xuất lịch tập bù cho ca viên dựa trên dữ liệu hiện có."
                  ].map((suggestion, idx) => (
                    <button key={idx} onClick={() => setInput(suggestion)} className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-[2rem] text-[10px] font-bold text-slate-600 hover:bg-white transition-all border border-black/5 shadow-md text-left flex items-center gap-4 group">
                      <Sparkles size={16} className="text-amber-400 group-hover:rotate-12 transition-transform" /> {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-5 duration-500`}>
              <div className={`max-w-[85%] rounded-[2.5rem] p-10 shadow-2xl border border-white/50 ${
                msg.role === 'user' 
                ? 'bg-slate-800 text-white' 
                : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 backdrop-blur-md border border-white/30 dark:border-slate-800'
              }`}
              style={msg.role === 'user' && isSpring ? { backgroundColor: springColor } : {}}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed font-semibold">
                  {String(msg.content)}
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Tham khảo từ trung tâm dữ liệu:</p>
                    <div className="flex flex-wrap gap-3">
                      {msg.sources.map((s, idx) => (
                        <a key={idx} href={String(s.uri)} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-bold text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                          <ExternalLink size={12} /> {String(s.title)}
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
               <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-[2.5rem] p-10 flex flex-col gap-6 min-w-[350px] border border-white dark:border-slate-800 shadow-2xl">
                  <div className="flex items-center gap-5">
                    <Loader2 size={28} className="animate-spin text-slate-400" />
                    <span className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                      {mode === 'pro' ? 'Đang kích hoạt tư duy thấu đáo...' : 'Đang truy vấn dữ liệu đám mây...'}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                       <div className="h-full bg-emerald-500 w-1/3 animate-progress"></div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic text-center">AngelBrain đang xử lý yêu cầu của bạn...</p>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="p-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-t border-white/50 dark:border-slate-800">
          <div className="relative max-w-4xl mx-auto group">
            <textarea 
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Nhập yêu cầu quản trị hoặc câu hỏi về thánh ca..."
              className="w-full pl-10 pr-28 py-8 bg-white dark:bg-slate-950 rounded-[2.5rem] border-none outline-none text-base font-bold shadow-2xl focus:ring-8 focus:ring-black/5 transition-all resize-none overflow-hidden"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }}
              className="absolute right-4 top-4 w-16 h-16 flex items-center justify-center text-white rounded-[1.8rem] shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-30 transition-all border border-white/20"
            >
              <Send size={28} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
