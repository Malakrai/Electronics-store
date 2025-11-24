export interface User {
  id?: number;
  username: string;
  email: string;
  password?: string;
  role: 'admin' | 'magasinier' | 'client';
  createdAt?: Date;
  updatedAt?: Date;
}