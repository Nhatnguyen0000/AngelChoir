
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, ArrowUpCircle, ArrowDownCircle, Plus, 
  Layers, Trash2, X, Repeat, Target, ChevronRight, Activity, 
  Calendar, Info, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { getTransactions, saveTransactions, getSpringColor, getBudgets, saveBudgets, getRecurringTransactions, saveRecurringTransactions } from '../store';
import { Transaction, Budget, RecurringTransaction } from '../types';

const CATEGORIES = ['Đóng góp', 'Cơ sở vật chất', 'Liên hoan', 'Nhạc cụ', 'Từ thiện', 'Khác'];

const Finance: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  
  const [activeView, setActiveView] = useState<'overview' | 'transactions' | 'budgets' | 'recurring'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Transaction>>({ type: 'income', category: 'Đóng góp', isRecurring: false, amount: 0 });
  const [budgetFormData, setBudgetFormData] = useState<Partial<Budget>>({ category: 'Liên hoan', limit: 1000000, period: 'monthly' });

  const springColor = getSpringColor();
  const currentTheme = localStorage.getItem('theme') || 'light';
  const isSpring = currentTheme === 'spring';

  useEffect(() => {
    setTransactions(getTransactions());
    setBudgets(getBudgets());
    setRecurring(getRecurringTransactions());
  }, []);

  const totals = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const categoryBreakdown = useMemo(() => {
    const breakdown: { [key: string]: number } = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
    });
    return Object.keys(breakdown).map(cat => ({ 
      name: cat, 
      value: breakdown[cat]
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const newTx: Transaction = {
      ...formData as Transaction,
      id: Date.now(),
      date: formData.date || new Date().toISOString().split('T')[0]
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    saveTransactions(updated);
    setIsModalOpen(false);
    
    if (formData.isRecurring) {
        const newRec: RecurringTransaction = {
            id: Date.now(),
            amount: newTx.amount,
            type: newTx.type,
            category: newTx.category,
            description: newTx.description || '',
            frequency: 'monthly',
            dayOfMonth: new Date().getDate()
        };
        const updatedRec = [...recurring, newRec];
        setRecurring(updatedRec);
        saveRecurringTransactions(updatedRec);
    }
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = budgets.findIndex(b => b.category === budgetFormData.category);
    let updated: Budget[];
    if (existing > -1) {
        updated = [...budgets];
        updated[existing] = budgetFormData as Budget;
    } else {
        updated = [...budgets, budgetFormData as Budget];
    }
    setBudgets(updated);
    saveBudgets(updated);
    setIsBudgetModalOpen(false);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700 px-4 pb-32">
      <div className="flex items-center justify-between px-2 pt-6">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Quản Lý Ngân Sách</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2">Đảm bảo minh bạch tài chính ca đoàn</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#020617' }}
          className="px-8 py-5 text-white rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border border-white/20"
        >
          <Plus size={24} strokeWidth={3} />
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Ghi Giao Dịch</span>
        </button>
      </div>

      <div className="flex bg-white/60 dark:bg-slate-900/60 p-2 rounded-[2.5rem] border border-black/5 shadow-sm backdrop-blur-xl w-fit">
         {['overview', 'transactions', 'budgets', 'recurring'].map(view => (
           <button 
             key={view}
             onClick={() => setActiveView(view as any)}
             className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
               activeView === view ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
             }`}
           >
             {view === 'overview' && 'Tổng quan'}
             {view === 'transactions' && 'Sổ cái'}
             {view === 'budgets' && 'Định mức'}
             {view === 'recurring' && 'Định kỳ'}
           </button>
         ))}
      </div>

      {activeView === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border border-black/5 flex items-center justify-between group">
             <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Số dư hiện tại</p>
                <p className={`text-3xl font-black tracking-tighter ${totals.balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500'}`}>{formatCurrency(totals.balance)}</p>
             </div>
             <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400"><Wallet size={28} /></div>
          </div>
          <div className="bg-emerald-500 p-8 rounded-[3rem] shadow-2xl text-white flex items-center justify-between">
             <div>
                <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-2">Tổng thu nhập</p>
                <p className="text-3xl font-black tracking-tighter">{formatCurrency(totals.income)}</p>
             </div>
             <ArrowUpCircle size={40} className="text-white/30" />
          </div>
          <div className="bg-red-500 p-8 rounded-[3rem] shadow-2xl text-white flex items-center justify-between">
             <div>
                <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-2">Tổng chi tiêu</p>
                <p className="text-3xl font-black tracking-tighter">{formatCurrency(totals.expense)}</p>
             </div>
             <ArrowDownCircle size={40} className="text-white/30" />
          </div>
        </div>
      )}

      {/* FINANCE ENTRY MODAL (As per screenshot) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[4rem] p-12 lg:p-16 shadow-2xl relative border border-white/20 animate-in zoom-in-95 duration-300">
             <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-lg"><X size={20} /></button>
             
             <div className="flex items-center gap-6 mb-12">
                <div className="w-20 h-20 bg-[#0F172A] rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl">
                   <Layers size={36} />
                </div>
                <div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter dark:text-white">Ghi Sổ Giao Dịch</h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 tracking-[0.3em]">Đảm bảo tính minh bạch cho quỹ ca đoàn</p>
                </div>
             </div>

             <form onSubmit={handleSaveTransaction} className="space-y-10">
                <div className="grid grid-cols-2 gap-10">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-6 tracking-widest">Phân loại</label>
                      <select className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-950 dark:border-white outline-none text-sm font-bold dark:text-white shadow-inner" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}><option value="income">THU NHẬP (+)</option><option value="expense">CHI TIÊU (-)</option></select>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-6 tracking-widest">Hạng mục</label>
                      <select className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-950 dark:border-white outline-none text-sm font-bold dark:text-white shadow-inner" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                         {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                      </select>
                   </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-6 tracking-widest">Số tiền thực tế</label>
                  <div className="relative">
                     <span className="absolute left-10 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-300">₫</span>
                     <input type="number" required placeholder="0" className="w-full pl-24 pr-10 py-10 bg-slate-50 dark:bg-slate-800 rounded-[2.8rem] border-2 border-slate-950 dark:border-white outline-none text-5xl font-black dark:text-white shadow-inner" value={formData.amount} onChange={e => setFormData({...formData, amount: parseInt(e.target.value)})}/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10 items-center">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-6 tracking-widest">Ngày giao dịch</label>
                      <input type="date" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-950 dark:border-white outline-none text-sm font-bold dark:text-white" value={formData.date || new Date().toISOString().split('T')[0]} onChange={e => setFormData({...formData, date: e.target.value})}/>
                   </div>
                   <div className="flex items-center gap-4 cursor-pointer pt-6 select-none group" onClick={() => setFormData({...formData, isRecurring: !formData.isRecurring})}>
                      <div className={`w-14 h-14 rounded-2xl border-2 border-slate-950 dark:border-white flex items-center justify-center transition-all ${formData.isRecurring ? 'bg-blue-600 border-blue-600 text-white shadow-xl' : 'bg-slate-50 dark:bg-slate-800 text-slate-300'}`}>
                         <Repeat size={24} />
                      </div>
                      <div className="flex flex-col">
                         <span className={`text-[10px] font-black uppercase tracking-widest ${formData.isRecurring ? 'text-blue-600' : 'text-slate-400'}`}>Thiết lập định kỳ</span>
                         <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Lặp lại mỗi tháng</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-6 tracking-widest">Diễn giải</label>
                  <textarea className="w-full px-10 py-6 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border-2 border-slate-950 dark:border-white outline-none font-bold shadow-inner resize-none text-base dark:text-white" rows={3} placeholder="Nhập ghi chú chi tiết cho giao dịch..." value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 py-7 bg-[#0F172A] text-white rounded-full text-[13px] font-black tracking-[0.4em] uppercase shadow-2xl hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-5">
                    <CheckCircle2 size={24} /> HOÀN TẤT GHI SỔ
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-7 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">HỦY</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
