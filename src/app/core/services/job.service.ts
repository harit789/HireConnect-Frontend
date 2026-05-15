import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Application, Job, JobSearchParams } from '../models/job.model';

@Injectable({ providedIn: 'root' })
export class JobService {

  private base    = `${environment.apiUrl}/jobs`;
  private appBase = `${environment.apiUrl}/applications`;

  constructor(private http: HttpClient) {}



  getAllActiveJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(this.base);
  }

  getJobById(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.base}/${id}`);
  }

  searchJobs(params: JobSearchParams): Observable<Job[]> {
    let httpParams = new HttpParams();
    if (params.keyword)    httpParams = httpParams.set('keyword',    params.keyword);
    if (params.location)   httpParams = httpParams.set('location',   params.location);
    if (params.category)   httpParams = httpParams.set('category',   params.category);
    if (params.type)       httpParams = httpParams.set('type',       params.type);
    if (params.salaryMin)  httpParams = httpParams.set('salaryMin',  params.salaryMin);
    if (params.salaryMax)  httpParams = httpParams.set('salaryMax',  params.salaryMax);
    if (params.experience) httpParams = httpParams.set('experience', params.experience);
    return this.http.get<Job[]>(`${this.base}/search`, { params: httpParams });
  }

  getJobsByRecruiter(recruiterId: number): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.base}/recruiter/${recruiterId}`);
  }

  createJob(job: Partial<Job>): Observable<Job> {
    return this.http.post<Job>(this.base, job);
  }

  updateJob(id: number, job: Job): Observable<Job> {
    return this.http.put<Job>(`${this.base}/${id}`, job);
  }

  updateJobStatus(id: number, status: string): Observable<Job> {
    return this.http.patch<Job>(`${this.base}/${id}/status`, { status });
  }

  deleteJob(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }



  submitApplication(app: Partial<Application>): Observable<Application> {
    return this.http.post<Application>(this.appBase, app);
  }

  getApplicationsByCandidate(candidateId: number): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.appBase}/candidate/${candidateId}`);
  }

  getApplicationsByJob(jobId: number): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.appBase}/job/${jobId}`);
  }

  updateApplicationStatus(appId: number, status: string, note?: string): Observable<Application> {
    return this.http.patch<Application>(`${this.appBase}/${appId}/status`,
      { status, recruiterNote: note });
  }


  withdrawApplication(appId: number): Observable<any> {
    return this.http.delete(`${this.appBase}/${appId}/withdraw`);
  }

  hasApplied(jobId: number, candidateId: number): Observable<{ applied: boolean }> {
    return this.http.get<{ applied: boolean }>(
      `${this.appBase}/check?jobId=${jobId}&candidateId=${candidateId}`);
  }

  getApplicationCount(jobId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.appBase}/job/${jobId}/count`);
  }
}
