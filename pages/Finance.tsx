
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, ArrowUpCircle, ArrowDownCircle, Plus, 
  TrendingUp, DollarSign, Layers, Filter, Trash2,
  PieChart as PieChartIcon, Activity, X
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell 
} from 'recharts';
import { getTransactions, saveTransactions, getSpringColor } from '../store';
import { Transaction } from '../types';

const Finance: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Transaction>>({ type: 'income', category: 'Đóng góp' });

  const springColor = getSpringColor();
  const currentTheme = localStorage.getItem('theme') || 'light';
  const isSpring = currentTheme === 'spring';

  useEffect(() => {
    setTransactions(getTransactions());
  }, []);

  const totals = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const chartData = useMemo(() => {
    const groups: { [key: string]: number } = {};
    [...transactions].reverse().forEach(t => {
      groups[t.date] = (groups[t.date] || 0) + (t.type === 'income' ? t.amount : -t.amount);
    });
    return Object.keys(groups).map(date => ({ date, balance: groups[date] }));
  }, [transactions]);

  const pieData = [
    { name: 'Thu nhập', value: totals.income, color: '#10b981' },
    { name: 'Chi tiêu', value: totals.expense, color: '#ef4444' }
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newTx: Transaction = {
      ...formData as Transaction,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    saveTransactions(updated);
    setIsModalOpen(false);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700 px-4 pb-32">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1 ml-4">
          <h2 className={`text-4xl font-black uppercase tracking-tighter ${isSpring ? 'text-slate-800' : 'text-[#0F172A] dark:text-white'}`}>Ngân Sách Ca Đoàn</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Kiểm soát tài chính minh bạch</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }}
          className="w-16 h-16 text-white rounded-[1.8rem] shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center border border-white/20"
        >
          <Plus size={32} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'TỔNG THU', val: totals.income, icon: ArrowUpCircle, color: 'emerald' },
          { label: 'TỔNG CHI', val: totals.expense, icon: ArrowDownCircle, color: 'red' },
          { label: 'SỐ DƯ QUỸ', val: totals.balance, icon: Wallet, color: 'slate' }
        ].map((s, i) => (
          <div key={i} className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white dark:border-slate-800 flex items-center gap-6 group transition-all hover:scale-105">
            <div className={`w-16 h-16 bg-${s.color}-50 dark:bg-${s.color}-900/20 text-${s.color}-500 rounded-2xl flex items-center justify-center shadow-inner`}><s.icon size={30} /></div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-2xl font-black tracking-tighter leading-none ${s.color === 'emerald' ? 'text-emerald-600' : s.color === 'red' ? 'text-red-600' : 'text-slate-800 dark:text-white'}`}>{formatCurrency(s.val)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-xl border border-white dark:border-slate-800">
           <div className="flex items-center justify-between mb-10"><h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3"><Activity size={18} style={{ color: springColor }} /> Biến động dòng tiền</h3></div>
           <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                    <defs><linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={isSpring ? springColor : "#3B82F6"} stopOpacity={0.2}/><stop offset="95%" stopColor={isSpring ? springColor : "#3B82F6"} stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={currentTheme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 'bold'}} />
                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}} />
                    <Area type="monotone" dataKey="balance" stroke={isSpring ? springColor : "#3B82F6"} strokeWidth={5} fill="url(#colorBalance)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="lg:col-span-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-xl border border-white dark:border-slate-800 flex flex-col justify-center items-center">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-8">Phân bổ nguồn vốn</h3>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <RePieChart>
                    <Pie data={pieData} innerRadius={60} outerRadius={85} paddingAngle={10} dataKey="value">{pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                 </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 space-y-3 w-full">
               {pieData.map(p => (
                 <div key={p.name} className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-black/5 shadow-sm">
                    <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></div><span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{p.name}</span></div>
                    <span className="text-xs font-black dark:text-white">{Math.round((p.value / (totals.income + totals.expense || 1)) * 100)}%</span>
                 </div>
               ))}
            </div>
        </div>
      </div>

      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white dark:border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Sổ cái chi tiết</h3>
           <div className="px-5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-black/5 shadow-sm flex items-center gap-2"><Filter size={14} className="text-slate-400" /><span className="text-[9px] font-black uppercase text-slate-500">Lọc dữ liệu</span></div>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="py-5 px-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">Ngày</th>
                <th className="py-5 px-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">Danh mục</th>
                <th className="py-5 px-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">Ghi chú</th>
                <th className="py-5 px-8 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Số tiền</th>
                <th className="py-5 px-8 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.map(t => (
                <tr key={t.id} className="group hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300">
                  <td className="py-5 px-8 text-[11px] font-bold text-slate-400 uppercase">{t.date}</td>
                  <td className="py-5 px-8"><span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{t.category}</span></td>
                  <td className="py-5 px-8 text-xs font-semibold text-slate-400 italic">"{t.description}"</td>
                  <td className={`py-5 px-8 text-right font-black tracking-tighter text-lg ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</td>
                  <td className="py-5 px-8 text-center opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => { if(window.confirm('Xóa?')) { const u = transactions.filter(x => x.id !== t.id); setTransactions(u); saveTransactions(u); } }} className="text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4 animate-in zoom-in-95 duration-300">
          <div className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-[4rem] p-16 shadow-2xl relative border border-white/20">
             <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-3xl hover:bg-red-500 hover:text-white transition-all"><X size={24} /></button>
             <h3 className="text-4xl font-black uppercase tracking-tighter mb-10 dark:text-white">Thêm giao dịch</h3>
             <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Loại hình</label>
                      <select className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 rounded-[2rem] outline-none text-sm font-bold dark:text-white shadow-inner focus:ring-2 focus:ring-black/5" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}><option value="income">THU NHẬP (+)</option><option value="expense">CHI TIÊU (-)</option></select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Danh mục</label>
                      <input type="text" placeholder="Đóng góp, Quỹ..." value={formData.category} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-none outline-none text-sm font-bold dark:text-white shadow-inner focus:ring-2 focus:ring-black/5" onChange={e => setFormData({...formData, category: e.target.value})}/>
                   </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Số tiền giao dịch</label>
                  <input type="number" required placeholder="0" className="w-full px-10 py-8 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-none outline-none text-4xl font-black dark:text-white shadow-inner" onChange={e => setFormData({...formData, amount: parseInt(e.target.value)})}/>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Nội dung</label>
                  <textarea className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-none outline-none font-bold shadow-inner resize-none" rows={3} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
                <button type="submit" style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }} className="w-full py-6 text-white rounded-full text-[12px] font-black tracking-widest uppercase shadow-xl hover:scale-105 transition-all">HOÀN TẤT GHI SỔ</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
