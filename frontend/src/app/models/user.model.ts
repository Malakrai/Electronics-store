export interface User {
  id: number;
  email: string;
  userType: string;
  firstName: string;
  lastName: string;
  roles?: string[];
  username?: string;
  phone?: string;
  address?: string;
  enabled?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  googleAuthEnabled?: boolean;
}

// Keep all your other interfaces as they are
export interface LoginRequest {
  email: string;
  password: string;
  totpCode?: string;
}

export interface LoginResponse {
  token: string;
  userType: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  requires2fa: boolean;
  roles?: string[];
}

export interface AdminLoginResponse {
  qrCodeRequired?: boolean;
  qrCodeUrl?: string;
  message?: string;
  jwtToken?: string;
  email?: string;
  roles?: string[];
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otpCode: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  message: string;
}

export interface VerifyOtpRequest {
  email: string;
  otpCode: string;
}

export interface Enable2faRequest {
  email: string;
}

export interface Verify2faRequest {
  email: string;
  password: string;
  totpCode: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
