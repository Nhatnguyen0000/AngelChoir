
import { ThanhVien, LichTap, User, Role, Status, Gender, MemberRole, Song, SystemNotice } from './types';

const INITIAL_MEMBERS: ThanhVien[] = [];
const INITIAL_SCHEDULES: LichTap[] = [];
const INITIAL_SONGS: Song[] = [];

export const getMembers = (): ThanhVien[] => {
  const data = localStorage.getItem('members');
  return data ? JSON.parse(data) : INITIAL_MEMBERS;
};

export const saveMembers = (members: ThanhVien[]) => {
  localStorage.setItem('members', JSON.stringify(members));
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

export const loginUser = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const updateUserProfile = (fullName: string, avatarUrl?: string) => {
  const user = getCurrentUser();
  user.fullName = fullName;
  if (avatarUrl) user.avatar = avatarUrl;
  loginUser(user);
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

// Advanced: Export/Import Logic
export const exportSystemData = () => {
  const data = {
    members: getMembers(),
    schedules: getSchedules(),
    songs: getSongs(),
    config: {
      springColor: getSpringColor(),
      theme: localStorage.getItem('theme') || 'light',
      notice: getNotice()
    },
    version: '2.0.0',
    exportDate: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `angelchoir_backup_${new Date().getTime()}.json`;
  a.click();
};

export const importSystemData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    if (data.members) saveMembers(data.members);
    if (data.schedules) saveSchedules(data.schedules);
    if (data.songs) saveSongs(data.songs);
    if (data.config?.springColor) saveSpringColor(data.config.springColor);
    if (data.config?.notice) saveNotice(data.config.notice);
    return true;
  } catch (e) {
    console.error('Import failed', e);
    return false;
  }
};
