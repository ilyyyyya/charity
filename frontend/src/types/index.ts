export type Role = 'ADMIN' | 'VOLUNTEER' | 'DONOR' | 'OWNER';

export type FundStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface Fund {
  id: number;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  ownerUsername: string;
  username: string;
  ownerId: number;
  category: string;
  imageName: string;
  imageType: string;
  status: FundStatus;
  imageUrl: string;
}

export interface OrganizerProfileResponse {
  id: number;
  username: string;
  displayName: string | null;
  funds: Fund[];
}

export interface User {
  id: number;
  username: string;
  role: Role;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegistrationRequest {
  username: string;
  password: string;
  role: Role;
}

export interface VolunteerRequestResponse {
  id: number;
  fundId: number;
  fundTitle: string;
  volunteerName: string;
  email: string;
  telegram: string;
  city: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface FundReport {
    id: number;
    fundId: number;
    fundTitle: string;
    description: string;
    totalSpent: number;
    expenses: string[];
    purchases: string[];
    photos: ReportPhoto[];
    createdAt: string;
}

export interface ReportPhoto {
    id: number;
    fileName: string;
    fileType: string;
}

export interface CreateFundReportRequest {
    description: string;
    totalSpent: number;
    expenses: string[];
    purchases: string[];
    photos?: File[];
}