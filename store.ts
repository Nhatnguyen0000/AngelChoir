
import { ThanhVien, LichTap, User, Role, Status, Gender, MemberRole, Song, SystemNotice, Transaction, Budget, RecurringTransaction } from './types';

const INITIAL_MEMBERS: ThanhVien[] = [];
const INITIAL_SCHEDULES: LichTap[] = [];
const INITIAL_SONGS: Song[] = [];
const INITIAL_TRANSACTIONS: Transaction[] = [];

export const getMembers = (): ThanhVien[] => {
  const data = localStorage.getItem('members');
  return data ? JSON.parse(data) : INITIAL_MEMBERS;
};

export const saveMembers = (members: ThanhVien[]) => {
  localStorage.setItem('members', JSON.stringify(members));
};

export const getTransactions = (): Transaction[] => {
  const data = localStorage.getItem('transactions');
  return data ? JSON.parse(data) : INITIAL_TRANSACTIONS;
};

export const saveTransactions = (transactions: Transaction[]) => {
  localStorage.setItem('transactions', JSON.stringify(transactions));
};

export const getBudgets = (): Budget[] => {
  const data = localStorage.getItem('budgets');
  return data ? JSON.parse(data) : [
    { category: 'Cơ sở vật chất', limit: 2000000, period: 'monthly' },
    { category: 'Liên hoan', limit: 1000000, period: 'monthly' },
    { category: 'Nhạc cụ', limit: 500000, period: 'monthly' }
  ];
};

export const saveBudgets = (budgets: Budget[]) => {
  localStorage.setItem('budgets', JSON.stringify(budgets));
};

export const getRecurringTransactions = (): RecurringTransaction[] => {
  const data = localStorage.getItem('recurring_transactions');
  return data ? JSON.parse(data) : [];
};

export const saveRecurringTransactions = (r: RecurringTransaction[]) => {
  localStorage.setItem('recurring_transactions', JSON.stringify(r));
};

export const getSchedules = (): LichTap[] => {
  const data = localStorage.getItem('schedules');
  return data ? JSON.parse(data) : INITIAL_SCHEDULES;
};

export const saveSchedules = (schedules: LichTap[]) => {
  localStorage.setItem('schedules', JSON.stringify(schedules));
};

export const getSongs = (): Song[] => {
  const data = localStorage.getItem('songs');
  return data ? JSON.parse(data) : INITIAL_SONGS;
};

export const saveSongs = (songs: Song[]) => {
  localStorage.setItem('songs', JSON.stringify(songs));
};

export const getSpringColor = (): string => {
  return localStorage.getItem('springPrimaryColor') || '#7F1D1D';
};

export const saveSpringColor = (color: string) => {
  localStorage.setItem('springPrimaryColor', color);
  window.dispatchEvent(new CustomEvent('springColorChange', { detail: color }));
};

export const getNotice = (): SystemNotice => {
  const data = localStorage.getItem('system_notice');
  return data ? JSON.parse(data) : {
    title: 'Mừng Lễ Phục Sinh 2024',
    content: 'Lịch tập hát bổ sung đã sẵn sàng. Ca viên vui lòng xem tại thư viện để tải bản nhạc mới.',
    buttonText: 'XEM LỊCH',
    isVisible: true
  };
};

export const saveNotice = (notice: SystemNotice) => {
  localStorage.setItem('system_notice', JSON.stringify(notice));
};

export const getCurrentUser = (): User => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      return JSON.parse(user);
    } catch (e) {
      console.error('Failed to parse user from storage');
    }
  }
  return {
    id: 1,
    username: 'admin',
    role: Role.Admin,
    fullName: 'Ban Điều Hành'
  };
};

export const loginUser = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const updateUserProfile = (fullName: string, avatar?: string) => {
  const user = getCurrentUser();
  const updatedUser = { ...user, fullName, avatar };
  localStorage.setItem('user', JSON.stringify(updatedUser));
};

export const exportSystemData = () => {
  const data = {
    members: getMembers(),
    transactions: getTransactions(),
    budgets: getBudgets(),
    recurring: getRecurringTransactions(),
    schedules: getSchedules(),
    songs: getSongs(),
    notice: getNotice(),
    user: getCurrentUser(),
    springPrimaryColor: getSpringColor()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `AngelChoir_Backup_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const importSystemData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (data.members) saveMembers(data.members);
    if (data.transactions) saveTransactions(data.transactions);
    if (data.budgets) saveBudgets(data.budgets);
    if (data.recurring) saveRecurringTransactions(data.recurring);
    if (data.schedules) saveSchedules(data.schedules);
    if (data.songs) saveSongs(data.songs);
    if (data.notice) saveNotice(data.notice);
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
    if (data.springPrimaryColor) localStorage.setItem('springPrimaryColor', data.springPrimaryColor);
    return true;
  } catch (e) {
    console.error('Import failed', e);
    return false;
  }
};
