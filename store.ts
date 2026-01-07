
import { ThanhVien, LichTap, User, Role, Status, Gender, MemberRole, Song } from './types';

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
