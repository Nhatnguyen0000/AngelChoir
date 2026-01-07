
export enum Role { Admin = 'Admin', User = 'User' }
export enum Gender { Nam = 'Nam', Nu = 'Nữ' }
export enum Status { Active = 'Hoạt động', Inactive = 'Nghỉ hoạt động' }
export enum MemberRole {
  TruongCaDoan = 'Trưởng Ca Đoàn',
  CaTruong = 'Ca trưởng',
  NhacCong = 'Nhạc công',
  CaVien = 'Ca viên'
}

export type Theme = 'light' | 'dark' | 'spring';

export interface ThanhVien {
  id: number;
  tenThanh: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: Gender;
  queQuan: string;
  soDienThoai: string;
  ngayGiaNhap: string;
  vaiTro: MemberRole;
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

export interface Song {
  id: number;
  title: string;
  composer: string;
  category: string;
}

export interface User {
  id: number;
  username: string;
  role: Role;
  fullName: string;
  avatar?: string;
}
