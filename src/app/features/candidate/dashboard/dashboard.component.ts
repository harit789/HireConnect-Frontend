import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { JobService } from '../../../core/services/job.service';
import { InterviewService } from '../../../core/services/interview.service';
import { Application } from '../../../core/models/job.model';
import { Interview } from '../../../core/models/interview.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-candidate-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Welcome back! {{ userName }}</h1>
        <p class="subtitle">Here's your job search overview</p>
      </div>

      <!-- Stats row -->
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-num">{{ totalApps }}</span>
          <span class="stat-label">Total Applications</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">{{ shortlisted }}</span>
          <span class="stat-label">Shortlisted</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">{{ interviews }}</span>
          <span class="stat-label">Interviews Scheduled</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">{{ offered }}</span>
          <span class="stat-label">Offers Received</span>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <a routerLink="/jobs" class="action-card">
          <span class="material-icons action-icon">search</span>
          <span>Browse Jobs</span>
        </a>
        <a routerLink="/candidate/applications" class="action-card">
          <span class="material-icons action-icon">description</span>
          <span>My Applications</span>
        </a>
        <a routerLink="/candidate/interviews" class="action-card">
          <span class="material-icons action-icon">event</span>
          <span>My Interviews</span>
        </a>
        <a routerLink="/candidate/profile" class="action-card">
          <span class="material-icons action-icon">person</span>
          <span>Edit Profile</span>
        </a>
      </div>

      <!-- Recent Applications -->
      <div class="section">
        <div class="section-header">
          <h2>Recent Applications</h2>
          <a routerLink="/candidate/applications" class="link-sm">View all</a>
        </div>
        <div class="table-wrap" *ngIf="recentApps.length > 0">
          <table class="data-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Applied On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let app of recentApps">
                <td>#{{ app.jobId }}</td>
                <td>{{ app.appliedAt | date:'mediumDate' }}</td>
                <td><span class="badge" [ngClass]="statusClass(app.status)">
                  {{ app.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="empty-msg" *ngIf="recentApps.length === 0">
          No applications yet. <a routerLink="/jobs">Start browsing jobs!</a>
        </p>
      </div>

      <!-- Upcoming Interviews -->
      <div class="section">
        <div class="section-header">
          <h2>Upcoming Interviews</h2>
          <a routerLink="/candidate/interviews" class="link-sm">View all</a>
        </div>
        <div *ngIf="upcomingInterviews.length > 0">
          <div class="interview-card" *ngFor="let iv of upcomingInterviews">
            <div class="iv-info">
              <span class="iv-date">{{ iv.scheduledAt | date:'medium' }}</span>
              <span class="iv-mode badge badge-type">{{ iv.mode }}</span>
            </div>
            <div *ngIf="iv.meetLink" class="iv-link">
              <a [href]="iv.meetLink" target="_blank" class="btn btn-sm btn-primary">
                Join Meeting
              </a>
            </div>
            <span class="badge" [ngClass]="statusClass(iv.status)">{{ iv.status }}</span>
          </div>
        </div>
        <p class="empty-msg" *ngIf="upcomingInterviews.length === 0">
          No upcoming interviews.
        </p>
      </div>
    </div>
  `
})
export class CandidateDashboardComponent implements OnInit {
  totalApps = 0; shortlisted = 0; interviews = 0; offered = 0;
  recentApps: Application[] = [];
  upcomingInterviews: Interview[] = [];
  userName = '';

  constructor(
    private authService: AuthService,
    private jobService: JobService,
    private interviewService: InterviewService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    const defaultName = this.authService.getEmail() ? this.authService.getEmail().split('@')[0] : '';
    this.http.get<any>(`${environment.apiUrl}/profile/candidate/user/${userId}`).subscribe({
      next: (p) => this.userName = p.fullName || defaultName,
      error: () => this.userName = defaultName
    });
    this.jobService.getApplicationsByCandidate(userId).subscribe({
      next: apps => {
        apps = apps || [];
        this.recentApps  = apps.slice(0, 5);
        this.totalApps   = apps.length;
        this.shortlisted = apps.filter(a => a.status === 'SHORTLISTED').length;
        this.interviews  = apps.filter(a => a.status === 'INTERVIEW_SCHEDULED').length;
        this.offered     = apps.filter(a => a.status === 'OFFERED').length;
      },
      error: () => {}
    });
    this.interviewService.getByCandidate(userId).subscribe({
      next: ivs => {
        ivs = ivs || [];
        this.upcomingInterviews = ivs
          .filter(i => i.status !== 'CANCELLED' && i.status !== 'COMPLETED')
          .slice(0, 3);
      },
      error: () => {}
    });
  }

  statusClass(status?: string): string {
    const map: any = {
      APPLIED: 'badge-gray', SHORTLISTED: 'badge-blue',
      INTERVIEW_SCHEDULED: 'badge-yellow', OFFERED: 'badge-green',
      REJECTED: 'badge-red', SCHEDULED: 'badge-blue',
      CONFIRMED: 'badge-green', CANCELLED: 'badge-red'
    };
    return map[status ?? ''] ?? 'badge-gray';
  }
}
