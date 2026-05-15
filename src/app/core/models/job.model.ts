export interface Job {
  id?: number;
  jobId?: number;
  title: string;
  category: string;
  type: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  description?: string;
  skills: string[];
  experienceRequired?: number;
  postedBy: number;
  status?: string;
  postedAt?: string;
  deadline?: string;
  companyName?: string;
}

export interface Application {
  applicationId?: number;
  jobId: number;
  candidateId: number;
  appliedAt?: string;
  status?: string;
  coverLetter?: string;
  resumeUrl?: string;
  recruiterNote?: string;
}

export interface JobSearchParams {
  keyword?: string;
  location?: string;
  category?: string;
  type?: string;
  salaryMin?: number;
  salaryMax?: number;
  experience?: number;
}
