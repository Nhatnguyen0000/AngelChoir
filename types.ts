
export enum Role { Admin = 'Admin', User = 'User' }
export enum Gender { Nam = 'Nam', Nu = 'Nữ' }
export enum Status { Active = 'Hoạt động', Inactive = 'Nghỉ hoạt động' }
export enum MemberRole {
  TruongCaDoan = 'Trưởng Ca Đoàn',
  CaTruong = 'Ca trưởng',
  NhacCong = 'Nhạc công',
  CaVien = 'Ca viên'
}

export interface VoiceSkills {
  range: number;      // 1-10
  technique: number;  // 1-10
  musicTheory: number; // 1-10
  sightReading: number; // 1-10
}

export type Theme = 'light' | 'dark' | 'spring';

export interface ThanhVien {
  id: number;
  tenThanh: string;
  hoTen: string;
  avatar?: string;
  ngaySinh: string;
  gioiTinh: Gender;
  queQuan: string;
  soDienThoai: string;
  ngayGiaNhap: string;
  vaiTro: MemberRole;
  skills?: VoiceSkills;
  instruments?: string[];
  ghiChu: string;
  trangThai: Status;
  points: number;
}

export interface LichTap {
  id: number;
  ngayTap: string;
  gio: string;
  noiDung: string;
  thanhVienThamGia: number[];
}

export interface Transaction {
  id: number;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  memberId?: number;
  isRecurring?: boolean;
}

export interface Budget {
  category: string;
  limit: number;
  period: 'monthly' | 'yearly';
}

export interface RecurringTransaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  frequency: 'monthly' | 'weekly';
  dayOfMonth?: number;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  thought?: string;
  sources?: { title: string; uri: string }[];
  timestamp: number;
}

export interface Song {
  id: number;
  title: string;
  composer: string;
  category: string;
  sheetMusicUrl?: string;
}

export interface User {
  id: number;
  username: string;
  role: Role;
  fullName: string;
  avatar?: string;
}

export interface SystemNotice {
  title: string;
  content: string;
  buttonText: string;
  isVisible: boolean;
}
