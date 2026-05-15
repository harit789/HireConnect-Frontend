export interface AuthResponse {
  token?: string;
  role?: string;
  userId?: string;
  email?: string;
  message: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: 'CANDIDATE' | 'RECRUITER';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CandidateProfile {
  profileId?: number;
  userId: number;
  fullName: string;
  email: string;
  mobile?: number;
  dob?: string;
  gender?: string;
  skills: string[];
  experience: number;
  resumeUrl?: string;
  summary?: string;
  address?: Address;
}

export interface RecruiterProfile {
  profileId?: number;
  userId: number;
  fullName: string;
  email: string;
  companyName: string;
  companySize?: string;
  industry?: string;
  website?: string;
  designation?: string;
  address?: Address;
}

export interface Address {
  houseNo?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: number;
}
