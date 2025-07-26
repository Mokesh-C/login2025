export interface OtpPayload {
  mobile: string;
}

export interface OtpResponse {
  success: boolean;
  message?: string;
  refreshToken?: string;
}

export interface AccessTokenResponse {
  success: boolean;
  message?: string;
  accessToken?: string;
}

export interface CreateUserPayload {
  name: string;
  mobile: string;
}

export interface RegisterStudentPayload {
  college: string;
  field: string;
  programme: string;
  year: number;
} 