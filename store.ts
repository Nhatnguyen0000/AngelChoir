
import { ThanhVien, LichTap, User, Role, Status, Gender, MemberRole, Song, SystemNotice, Transaction } from './types';

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

/**
 * Fix: Added missing loginUser function to persist user session.
 */
export const loginUser = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Fix: Added missing updateUserProfile function to update current user metadata.
 */
export const updateUserProfile = (fullName: string, avatar?: string) => {
  const user = getCurrentUser();
  const updatedUser = { ...user, fullName, avatar };
  localStorage.setItem('user', JSON.stringify(updatedUser));
};

/**
 * Fix: Added missing exportSystemData function to generate a downloadable JSON backup.
 */
export const exportSystemData = () => {
  const data = {
    members: getMembers(),
    transactions: getTransactions(),
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

/**
 * Fix: Added missing importSystemData function to restore system state from a JSON string.
 */
export const importSystemData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (data.members) saveMembers(data.members);
    if (data.transactions) saveTransactions(data.transactions);
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
