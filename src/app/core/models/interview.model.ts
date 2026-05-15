export interface Interview {
  interviewId?: number;
  applicationId: number;
  candidateId: number;
  recruiterId: number;
  scheduledAt: string;
  mode: 'ONLINE' | 'IN_PERSON';
  meetLink?: string;
  location?: string;
  status?: string;
  notes?: string;
  candidateEmail?: string;
  recruiterEmail?: string;
}

export interface Notification {
  notificationId?: number;
  userId: number;
  type: string;
  message: string;
  isRead: boolean;
  referenceId?: number;
  referenceType?: string;
  createdAt?: string;
}

export interface Subscription {
  subscriptionId?: number;
  recruiterId: number;
  plan: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  amountPaid?: number;
}

export interface Invoice {
  invoiceId?: number;
  subscriptionId: number;
  recruiterId: number;
  amount: number;
  paymentDate?: string;
  paymentMode: string;
  transactionId?: string;
  paymentStatus?: string;
  planName?: string;
}

export interface AnalyticsSummary {
  recruiterId?: number;
  totalJobsPosted?: number;
  activeJobs?: number;
  closedJobs?: number;
  totalApplications?: number;
  shortlistedCount?: number;
  interviewScheduledCount?: number;
  offeredCount?: number;
  rejectedCount?: number;
  viewToApplyRatio?: number;
  avgTimeToHireDays?: number;
  offerAcceptanceRate?: number;
  applicationsByStatus?: { [key: string]: number };
  jobsByCategory?: { [key: string]: number };
  // Platform-wide admin fields
  totalCandidates?: number;
  totalRecruiters?: number;
  totalJobsOnPlatform?: number;
  totalApplicationsOnPlatform?: number;
  activeSubscriptions?: number;
  totalRevenue?: number;
}
