
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, ArrowUpCircle, ArrowDownCircle, Plus, 
  TrendingUp, DollarSign, Layers, Filter, Trash2,
  PieChart as PieChartIcon, Activity, X,
  Repeat, Target, ChevronRight, BarChart3,
  Calendar, Info, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts';
import { getTransactions, saveTransactions, getSpringColor, getBudgets, saveBudgets, getRecurringTransactions, saveRecurringTransactions } from '../store';
import { Transaction, Budget, RecurringTransaction } from '../types';

const CATEGORIES = ['Đóng góp', 'Cơ sở vật chất', 'Liên hoan', 'Nhạc cụ', 'Từ thiện', 'Sách nhạc', 'Khác'];

const Finance: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  
  const [activeView, setActiveView] = useState<'overview' | 'transactions' | 'budgets' | 'recurring'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Transaction>>({ type: 'income', category: 'Đóng góp', isRecurring: false });
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
      value: breakdown[cat],
      limit: budgets.find(b => b.category === cat)?.limit || 0
    })).sort((a, b) => b.value - a.value);
  }, [transactions, budgets]);

  const chartData = useMemo(() => {
    const groups: { [key: string]: number } = {};
    const sortedTxs = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    let runningBalance = 0;
    
    // Group by date and calculate running balance
    const dailyData: any[] = [];
    sortedTxs.forEach(t => {
      runningBalance += (t.type === 'income' ? t.amount : -t.amount);
      dailyData.push({ date: t.date, balance: runningBalance });
    });
    
    return dailyData.slice(-10); // Show last 10 entries for clarity
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
            description: newTx.description,
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

  const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#64748B'];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700 px-4 pb-32">
      {/* Header & Main Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h2 className={`text-4xl font-black uppercase tracking-tighter ${isSpring ? 'text-slate-800' : 'text-[#0F172A] dark:text-white'}`}>Quản Lý Ngân Sách</h2>
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Phân tích tài chính thông minh</p>
          </div>
        </div>

        <div className="flex bg-white/60 dark:bg-slate-900/60 p-2 rounded-[2.5rem] border border-black/5 shadow-xl backdrop-blur-xl shrink-0 self-start">
           {[
             { id: 'overview', icon: Activity, label: 'Tổng quan' },
             { id: 'transactions', icon: Layers, label: 'Sổ cái' },
             { id: 'budgets', icon: Target, label: 'Định mức' },
             { id: 'recurring', icon: Repeat, label: 'Định kỳ' }
           ].map(view => (
             <button 
               key={view.id}
               onClick={() => setActiveView(view.id as any)}
               className={`px-6 py-3 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                 activeView === view.id ? (isSpring ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-800 text-white shadow-lg') : 'text-slate-400 hover:text-slate-600'
               }`}
             >
               <view.icon size={16} />
               <span className="hidden sm:inline">{view.label}</span>
             </button>
           ))}
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }}
          className="px-8 py-5 text-white rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border border-white/20 self-start"
        >
          <Plus size={24} strokeWidth={3} />
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Ghi giao dịch</span>
        </button>
      </div>

      {activeView === 'overview' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-8 rounded-[3rem] shadow-xl border border-white dark:border-slate-800 flex items-center justify-between group overflow-hidden relative">
               <div className="relative z-10">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Số dư hiện tại</p>
                  <p className={`text-3xl font-black tracking-tighter ${totals.balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500'}`}>{formatCurrency(totals.balance)}</p>
               </div>
               <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform"><Wallet size={32} /></div>
               <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-slate-500/5 rounded-full blur-2xl"></div>
            </div>
            <div className="bg-emerald-500/95 p-8 rounded-[3rem] shadow-2xl shadow-emerald-500/20 text-white flex items-center justify-between group overflow-hidden relative">
               <div className="relative z-10">
                  <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-2">Tổng thu nhập</p>
                  <p className="text-3xl font-black tracking-tighter leading-none">{formatCurrency(totals.income)}</p>
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[9px] font-black uppercase"><ArrowUpCircle size={10} /> +12% so với tháng trước</div>
               </div>
               <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center text-white"><ArrowUpCircle size={32} /></div>
            </div>
            <div className="bg-red-500/95 p-8 rounded-[3rem] shadow-2xl shadow-red-500/20 text-white flex items-center justify-between group overflow-hidden relative">
               <div className="relative z-10">
                  <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-2">Tổng chi tiêu</p>
                  <p className="text-3xl font-black tracking-tighter leading-none">{formatCurrency(totals.expense)}</p>
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[9px] font-black uppercase"><ArrowDownCircle size={10} /> Tăng nhẹ (4%)</div>
               </div>
               <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center text-white"><ArrowDownCircle size={32} /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Balance Trend Area Chart */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 shadow-2xl border border-black/5">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter flex items-center gap-3"><Activity size={18} className="text-blue-500" /> Biến động dòng tiền (Gần đây)</h3>
                  <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest"><Calendar size={12} /> 10 Giao dịch cuối</div>
               </div>
               <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={isSpring ? springColor : "#3B82F6"} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={isSpring ? springColor : "#3B82F6"} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={currentTheme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                        <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}} />
                        <Area type="monotone" dataKey="balance" stroke={isSpring ? springColor : "#3B82F6"} strokeWidth={6} fill="url(#colorBalance)" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Spending Breakdown Pie Chart */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 shadow-2xl border border-black/5 flex flex-col items-center">
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-8 self-start flex items-center gap-3"><BarChart3 size={18} className="text-amber-500" /> Hạng mục chi tiêu</h3>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <RePieChart>
                        <Pie data={categoryBreakdown} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                           {categoryBreakdown.map((entry, index) => (<Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                     </RePieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-8 space-y-3 w-full max-h-[180px] overflow-y-auto no-scrollbar">
                   {categoryBreakdown.map((p, idx) => (
                     <div key={p.name} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                           <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pieColors[idx % pieColors.length] }}></div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-800 transition-colors">{p.name}</span>
                        </div>
                        <span className="text-xs font-black dark:text-white">{Math.round((p.value / (totals.expense || 1)) * 100)}%</span>
                     </div>
                   ))}
                </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'transactions' && (
        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border border-black/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
             <div>
               <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">Sổ cái chi tiết</h3>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Dữ liệu ghi chép lịch sử giao dịch</p>
             </div>
             <div className="flex items-center gap-3">
                <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-black/5 shadow-sm flex items-center gap-3">
                   <Filter size={14} className="text-slate-400" />
                   <span className="text-[9px] font-black uppercase text-slate-500">Tất cả thời gian</span>
                   <ChevronRight size={14} className="text-slate-300" />
                </div>
             </div>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-6 px-10 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Thời điểm</th>
                  <th className="py-6 px-10 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Hạng mục</th>
                  <th className="py-6 px-10 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Mô tả giao dịch</th>
                  <th className="py-6 px-10 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Giá trị</th>
                  <th className="py-6 px-10 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Quản lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.map(t => (
                  <tr key={t.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-all duration-300">
                    <td className="py-6 px-10">
                      <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                            {t.type === 'income' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                         </div>
                         <span className="text-[12px] font-bold text-slate-500 uppercase">{t.date}</span>
                      </div>
                    </td>
                    <td className="py-6 px-10">
                       <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border shadow-sm ${t.type === 'income' ? 'bg-white text-emerald-600 border-emerald-100' : 'bg-white text-red-600 border-red-100'}`}>
                          {t.category}
                       </span>
                    </td>
                    <td className="py-6 px-10">
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 dark:text-white leading-none mb-1">"{t.description}"</span>
                          {t.isRecurring && <span className="text-[8px] font-black text-blue-500 uppercase flex items-center gap-1"><Repeat size={10} /> Định kỳ</span>}
                       </div>
                    </td>
                    <td className={`py-6 px-10 text-right font-black tracking-tighter text-xl ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                       {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    <td className="py-6 px-10 text-center">
                       <button 
                         onClick={() => { if(window.confirm('Xác nhận xóa giao dịch này?')) { const u = transactions.filter(x => x.id !== t.id); setTransactions(u); saveTransactions(u); } }} 
                         className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                       >
                         <Trash2 size={18} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {transactions.length === 0 && (
             <div className="p-32 flex flex-col items-center justify-center text-center space-y-6 opacity-20">
                <Layers size={80} strokeWidth={1} />
                <p className="text-sm font-black uppercase tracking-widest">Chưa có giao dịch nào được ghi lại</p>
             </div>
          )}
        </div>
      )}

      {activeView === 'budgets' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets.map(budget => {
                  const spent = categoryBreakdown.find(c => c.name === budget.category)?.value || 0;
                  const percent = Math.min(Math.round((spent / budget.limit) * 100), 100);
                  const isOver = spent > budget.limit;
                  
                  return (
                    <div key={budget.category} className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-xl border border-black/5 flex flex-col relative overflow-hidden group">
                       <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-4">
                             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isOver ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500 shadow-inner'}`}>
                                <Target size={28} />
                             </div>
                             <div>
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Định mức</h4>
                                <p className="text-lg font-black text-slate-800 dark:text-white uppercase leading-none">{budget.category}</p>
                             </div>
                          </div>
                          <button onClick={() => { setBudgetFormData(budget); setIsBudgetModalOpen(true); }} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"><BarChart3 size={16} /></button>
                       </div>

                       <div className="space-y-4">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                             <span className="text-slate-400">Đã chi: {formatCurrency(spent)}</span>
                             <span className={isOver ? 'text-red-500' : 'text-slate-400'}>{percent}%</span>
                          </div>
                          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner p-1">
                             <div 
                               className={`h-full rounded-full transition-all duration-1000 ${isOver ? 'bg-red-500' : 'bg-emerald-500'}`} 
                               style={{ width: `${percent}%` }}
                             ></div>
                          </div>
                          <div className="flex items-center justify-between">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Giới hạn: {formatCurrency(budget.limit)}</span>
                             {isOver && <div className="flex items-center gap-1 text-[8px] font-black text-red-500 uppercase"><AlertTriangle size={10} /> Vượt hạn mức</div>}
                          </div>
                       </div>
                    </div>
                  );
              })}
              <button 
                onClick={() => { setBudgetFormData({ category: 'Mới', limit: 1000000, period: 'monthly' }); setIsBudgetModalOpen(true); }}
                className="rounded-[3rem] border-4 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4 text-slate-300 hover:border-blue-400 hover:text-blue-400 transition-all min-h-[250px] group"
              >
                 <Target size={48} className="group-hover:scale-110 transition-transform" />
                 <span className="text-[11px] font-black uppercase tracking-widest">Thiết lập định mức mới</span>
              </button>
           </div>
        </div>
      )}

      {activeView === 'recurring' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 p-8 rounded-[3rem] flex items-center gap-8 relative overflow-hidden">
              <div className="w-16 h-16 bg-amber-400 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shrink-0 z-10">
                 <Repeat size={32} />
              </div>
              <div className="z-10">
                 <h4 className="text-lg font-black text-amber-800 dark:text-amber-200 uppercase tracking-tighter mb-1">Quản lý giao dịch định kỳ</h4>
                 <p className="text-xs font-bold text-amber-700/70 max-w-2xl leading-relaxed italic">Hệ thống sẽ tự động đề xuất ghi vào sổ cái mỗi khi đến kỳ hạn thanh toán hoặc nhận đóng góp cố định hàng tháng.</p>
              </div>
              <Repeat size={140} className="absolute -right-10 -bottom-10 opacity-5 text-amber-500 rotate-12" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recurring.map(rec => (
                <div key={rec.id} className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-xl border border-black/5 flex flex-col group">
                   <div className="flex items-center justify-between mb-8">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${rec.type === 'income' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                         {rec.type === 'income' ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                      </div>
                      <button 
                        onClick={() => { if(window.confirm('Hủy bỏ định kỳ này?')) { const u = recurring.filter(x => x.id !== rec.id); setRecurring(u); saveRecurringTransactions(u); } }}
                        className="p-3 text-slate-200 hover:text-red-500 transition-colors"
                      >
                         <Trash2 size={18} />
                      </button>
                   </div>
                   <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{rec.category}</h3>
                   <p className="text-lg font-black text-slate-800 dark:text-white uppercase leading-tight mb-4 line-clamp-2">"{rec.description}"</p>
                   <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase mb-1">Định kỳ tháng</span>
                        <span className="text-xl font-black tracking-tighter text-slate-800 dark:text-white">{formatCurrency(rec.amount)}</span>
                      </div>
                      <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[8px] font-black text-slate-500 uppercase tracking-widest">Ngày {rec.dayOfMonth}</div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Main Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4 animate-in zoom-in-95 duration-300">
          <div className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-[4rem] p-12 lg:p-16 shadow-2xl relative border border-white/20">
             <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-3xl hover:bg-red-500 hover:text-white transition-all shadow-lg"><X size={24} /></button>
             
             <div className="flex items-center gap-4 mb-10">
                <div style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }} className="w-16 h-16 rounded-[1.8rem] flex items-center justify-center text-white shadow-xl">
                   <Layers size={30} />
                </div>
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter dark:text-white leading-none">Ghi sổ giao dịch</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Đảm bảo tính minh bạch cho quỹ ca đoàn</p>
                </div>
             </div>

             <form onSubmit={handleSaveTransaction} className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Phân loại</label>
                      <select className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-950 outline-none text-sm font-bold dark:text-white shadow-inner focus:ring-4 focus:ring-black/5" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}><option value="income">THU NHẬP (+)</option><option value="expense">CHI TIÊU (-)</option></select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Hạng mục</label>
                      <select className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-950 outline-none text-sm font-bold dark:text-white shadow-inner focus:ring-4 focus:ring-black/5" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                         {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                      </select>
                   </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Số tiền thực tế</label>
                  <div className="relative">
                     <span className="absolute left-10 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-300">₫</span>
                     <input type="number" required placeholder="0" className="w-full pl-20 pr-10 py-10 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-950 outline-none text-5xl font-black dark:text-white shadow-inner" onChange={e => setFormData({...formData, amount: parseInt(e.target.value)})}/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 items-center">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Ngày giao dịch</label>
                      <input type="date" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-950 outline-none text-sm font-bold dark:text-white" value={formData.date || new Date().toISOString().split('T')[0]} onChange={e => setFormData({...formData, date: e.target.value})}/>
                   </div>
                   <label className="flex items-center gap-4 cursor-pointer pt-6 select-none group">
                      <div className={`w-14 h-14 rounded-2xl border-2 border-slate-950 flex items-center justify-center transition-all ${formData.isRecurring ? 'bg-blue-500 border-blue-500 text-white shadow-lg' : 'bg-slate-50 text-slate-300'}`}>
                         <Repeat size={24} className={formData.isRecurring ? 'animate-spin-slow' : ''} />
                      </div>
                      <input type="checkbox" className="hidden" checked={formData.isRecurring} onChange={e => setFormData({...formData, isRecurring: e.target.checked})}/>
                      <div className="flex flex-col">
                         <span className={`text-[11px] font-black uppercase tracking-widest ${formData.isRecurring ? 'text-blue-500' : 'text-slate-400'}`}>Thiết lập định kỳ</span>
                         <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Lặp lại mỗi tháng</span>
                      </div>
                   </label>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Diễn giải</label>
                  <textarea className="w-full px-10 py-6 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-950 outline-none font-bold shadow-inner resize-none text-sm" rows={2} placeholder="Nhập ghi chú chi tiết cho giao dịch..." onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }} className="flex-1 py-6 text-white rounded-full text-[12px] font-black tracking-[0.4em] uppercase shadow-2xl hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3"><CheckCircle2 size={20} /> HOÀN TẤT GHI SỔ</button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-6 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">HỦY</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Budget Limit Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4 animate-in zoom-in-95 duration-300">
          <div className="bg-white dark:bg-slate-950 w-full max-w-xl rounded-[4rem] p-16 shadow-2xl relative border border-white/20">
             <button onClick={() => setIsBudgetModalOpen(false)} className="absolute top-10 right-10 p-4 bg-slate-50 rounded-3xl text-slate-400 hover:bg-red-500 transition-all"><X size={24} /></button>
             
             <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-16 bg-blue-50 rounded-[1.8rem] flex items-center justify-center text-blue-500 shadow-inner">
                   <Target size={30} />
                </div>
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter dark:text-white leading-none">Thiết lập định mức</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Kiểm soát trần chi tiêu hàng tháng</p>
                </div>
             </div>

             <form onSubmit={handleSaveBudget} className="space-y-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Hạng mục mục tiêu</label>
                   <select className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-950 outline-none text-sm font-bold dark:text-white shadow-inner" value={budgetFormData.category} onChange={e => setBudgetFormData({...budgetFormData, category: e.target.value})}>
                      {CATEGORIES.filter(c => c !== 'Đóng góp').map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Hạn mức chi tiêu tối đa (VND)</label>
                   <input type="number" required placeholder="0" className="w-full px-10 py-10 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-950 outline-none text-4xl font-black dark:text-white shadow-inner" value={budgetFormData.limit} onChange={e => setBudgetFormData({...budgetFormData, limit: parseInt(e.target.value)})}/>
                </div>
                <button type="submit" style={isSpring ? { backgroundColor: springColor } : { backgroundColor: '#0F172A' }} className="w-full py-6 text-white rounded-full text-[12px] font-black tracking-widest uppercase shadow-xl hover:scale-105 transition-all">LƯU CẤU HÌNH ĐỊNH MỨC</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
