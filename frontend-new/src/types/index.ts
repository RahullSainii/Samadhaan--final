export interface User {
  id: string;
  name: string;
  email: string;
  role: 'User' | 'Admin';
  phone?: string;
  address?: string;
  bio?: string;
}

export interface Complaint {
  _id: string;
  id: string; // Formatted ID like #001
  category: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Resolved';
  date: string;
  userId: string | Partial<User> | null;
  createdAt: string;
  updatedAt: string;
  location?: string;
  isAnonymous?: boolean;
  handledBy?: string;
  reportedBy?: string;
  attachmentCount?: number;
  attachments?: {
    name: string;
    type: string;
    size: number;
    data: string;
  }[];
  moderation?: {
    status: 'clean' | 'flagged' | 'blocked';
    spamScore: number;
    abusiveScore: number;
    duplicateScore: number;
    reasons: string[];
    duplicateComplaintIds: string[];
    detectedAt: string | null;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export interface ComplaintResponse {
  success: boolean;
  count?: number;
  data: Complaint | Complaint[];
}

export interface Stats {
  total: number;
  pending: number;
  resolved: number;
  categoryDistribution: {
    labels: string[];
    data: number[];
  };
  statusDistribution: {
    labels: string[];
    data: number[];
  };
}
