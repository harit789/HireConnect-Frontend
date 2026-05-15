import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { JobService } from '../../../core/services/job.service';
import { Job } from '../../../core/models/job.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-recruiter-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Welcome back! {{ userName }}</h1>
        <a routerLink="/recruiter/post-job" class="btn btn-primary">+ Post New Job</a>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-num">{{ totalJobs }} <small *ngIf="jobLimit > 0">/ {{ jobLimit }}</small></span>
          <span class="stat-label">{{ jobLimit === -1 ? 'Total Posts' : 'Posts Used' }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">{{ activeJobs }}</span>
          <span class="stat-label">Active</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">{{ pausedJobs }}</span>
          <span class="stat-label">Paused</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">{{ closedJobs }}</span>
          <span class="stat-label">Closed</span>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <a routerLink="/recruiter/post-job" class="action-card">
          <span class="material-icons action-icon">add</span><span>Post Job</span>
        </a>
        <a routerLink="/recruiter/manage-jobs" class="action-card">
          <span class="material-icons action-icon">list</span><span>Manage Jobs</span>
        </a>
        <a routerLink="/recruiter/analytics" class="action-card" *ngIf="isProfessional">
          <span class="material-icons action-icon">analytics</span><span>Analytics</span>
        </a>
        <a routerLink="/recruiter/subscription" class="action-card">
          <span class="material-icons action-icon">star</span><span>Subscription</span>
        </a>
      </div>

      <!-- Recent Job Posts -->
      <div class="section">
        <div class="section-header">
          <h2>My Job Posts</h2>
          <a routerLink="/recruiter/manage-jobs" class="link-sm">Manage all</a>
        </div>
        <div class="table-wrap" *ngIf="recentJobs.length > 0">
          <table class="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Type</th>
                <th>Status</th>
                <th>Posted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let job of recentJobs">
                <td>{{ job.title }}</td>
                <td>{{ job.location }}</td>
                <td>{{ job.type }}</td>
                <td>
                  <span class="badge" [ngClass]="statusClass(job.status)">
                    {{ job.status }}
                  </span>
                </td>
                <td>{{ job.postedAt | date:'mediumDate' }}</td>
                <td>
                  <a [routerLink]="['/recruiter/applications', job.jobId]"
                     class="btn btn-sm btn-outline">
                    View Applications
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="empty-state" *ngIf="recentJobs.length === 0">
          <p>No jobs posted yet.</p>
          <a routerLink="/recruiter/post-job" class="btn btn-primary">Post your first job</a>
        </div>
      </div>
    </div>
  `
})
export class RecruiterDashboardComponent implements OnInit {
  totalJobs = 0; activeJobs = 0; pausedJobs = 0; closedJobs = 0;
  recentJobs: Job[] = [];
  userName = '';
  jobLimit = 0;
  currentPlan = '';
  isProfessional = false;

  constructor(
    private authService: AuthService,
    private jobService: JobService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const recruiterId = this.authService.getUserId();
    const defaultName = this.authService.getEmail() ? this.authService.getEmail().split('@')[0] : '';
    this.http.get<any>(`${environment.apiUrl}/profile/recruiter/user/${recruiterId}`).subscribe({
      next: (p) => this.userName = p.fullName || p.companyName || defaultName,
      error: () => this.userName = defaultName
    });
    this.jobService.getJobsByRecruiter(recruiterId).subscribe({
      next: jobs => {
        this.recentJobs  = jobs.slice(0, 6);
        this.totalJobs   = jobs.length;
        this.activeJobs  = jobs.filter(j => j.status === 'ACTIVE').length;
        this.pausedJobs  = jobs.filter(j => j.status === 'PAUSED').length;
        this.closedJobs  = jobs.filter(j => j.status === 'CLOSED').length;
      },
      error: () => {}
    });
    
    // Fetch subscription for limits
    this.http.get<any>(`${environment.apiUrl}/subscriptions/recruiter/${recruiterId}/active`).subscribe({
      next: sub => {
        this.currentPlan = sub.plan;
        this.isProfessional = (sub.plan === 'PROFESSIONAL' || sub.plan === 'ENTERPRISE');
        this.http.get<any>(`${environment.apiUrl}/subscriptions/plan-info/${sub.plan}`).subscribe({
          next: info => {
            this.jobLimit = info.jobPostLimit === 'Unlimited' ? -1 : info.jobPostLimit;
          }
        });
      },
      error: () => {
        this.currentPlan = 'FREE';
        this.jobLimit = 3;
      }
    });
  }

  statusClass(status?: string): string {
    const map: any = { ACTIVE: 'badge-green', PAUSED: 'badge-yellow', CLOSED: 'badge-red' };
    return map[status ?? ''] ?? 'badge-gray';
  }
}
