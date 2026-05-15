import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AnalyticsSummary, Invoice, Subscription } from '../models/interview.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {

  private base      = `${environment.apiUrl}/subscriptions`;
  private analytics = `${environment.apiUrl}/analytics`;

  private planSubject = new BehaviorSubject<string>('FREE');
  plan$ = this.planSubject.asObservable();

  constructor(private http: HttpClient) {}

  subscribe(recruiterId: number, plan: string,
            paymentMode: string, amount: number): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.base}/subscribe`,
      { recruiterId, plan, paymentMode, amount })
      .pipe(tap(sub => this.planSubject.next(sub.plan)));
  }

  getActive(recruiterId: number): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.base}/recruiter/${recruiterId}/active`)
      .pipe(tap(sub => this.planSubject.next(sub.plan)));
  }

  getHistory(recruiterId: number): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.base}/recruiter/${recruiterId}`);
  }

  cancel(recruiterId: number): Observable<Subscription> {
    return this.http.patch<Subscription>(
      `${this.base}/recruiter/${recruiterId}/cancel`, {});
  }

  renew(recruiterId: number, plan: string,
        paymentMode: string, amount: number): Observable<Subscription> {
    return this.http.post<Subscription>(
      `${this.base}/recruiter/${recruiterId}/renew`,
      { plan, paymentMode, amount });
  }

  getInvoices(recruiterId: number): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.base}/invoices/recruiter/${recruiterId}`);
  }

  getPlanInfo(plan: string): Observable<any> {
    return this.http.get(`${this.base}/plan-info/${plan}`);
  }


  getRecruiterStats(recruiterId: number): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(`${this.analytics}/recruiter/${recruiterId}`);
  }

  getPlatformStats(): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(`${this.analytics}/admin`);
  }
}
