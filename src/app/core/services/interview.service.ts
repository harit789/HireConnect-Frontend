import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Interview, Notification } from '../models/interview.model';

@Injectable({ providedIn: 'root' })
export class InterviewService {

  private base      = `${environment.apiUrl}/interviews`;
  private notifBase = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}



  schedule(interview: Interview): Observable<Interview> {
    return this.http.post<Interview>(this.base, interview);
  }

  getByCandidate(candidateId: number): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.base}/candidate/${candidateId}`);
  }

  getByRecruiter(recruiterId: number): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.base}/recruiter/${recruiterId}`);
  }

  getByApplication(applicationId: number): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.base}/application/${applicationId}`);
  }

  confirm(interviewId: number): Observable<Interview> {
    return this.http.patch<Interview>(`${this.base}/${interviewId}/confirm`, {});
  }


  complete(interviewId: number): Observable<Interview> {
    return this.http.patch<Interview>(`${this.base}/${interviewId}/complete`, {});
  }

  reschedule(interviewId: number, data: Partial<Interview>): Observable<Interview> {
    return this.http.put<Interview>(`${this.base}/${interviewId}/reschedule`, data);
  }

  cancel(interviewId: number, requestedBy: number): Observable<Interview> {
    return this.http.patch<Interview>(
      `${this.base}/${interviewId}/cancel?requestedBy=${requestedBy}`, {});
  }



  getNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.notifBase}/user/${userId}`);
  }

  getUnreadCount(userId: number): Observable<{ unread: number }> {
    return this.http.get<{ unread: number }>(`${this.notifBase}/user/${userId}/count`);
  }

  markAsRead(notifId: number): Observable<Notification> {
    return this.http.patch<Notification>(`${this.notifBase}/${notifId}/read`, {});
  }

  markAllRead(userId: number): Observable<{ updated: number }> {
    return this.http.patch<{ updated: number }>(
      `${this.notifBase}/user/${userId}/read-all`, {});
  }
}
