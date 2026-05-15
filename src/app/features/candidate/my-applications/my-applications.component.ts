import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { JobService } from '../../../core/services/job.service';
import { Application } from '../../../core/models/job.model';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>My Applications</h1>
        <p class="subtitle">Track your job application pipeline</p>
      </div>

      <div class="pipeline-bar">
        <div class="pipeline-step" *ngFor="let step of pipeline">
          <div class="pipeline-count">{{ step.count }}</div>
          <div class="pipeline-label">{{ step.label }}</div>
        </div>
      </div>

      <div class="loading-spinner" *ngIf="loading">Loading...</div>
      <div class="alert alert-error" *ngIf="errorMsg">{{ errorMsg }}</div>

      <div class="table-wrap" *ngIf="!loading && applications.length > 0">
        <table class="data-table">
          <thead>
            <tr>
              <th>Application ID</th>
              <th>Job ID</th>
              <th>Applied On</th>
              <th>Status</th>
              <th>Recruiter Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let app of applications">
              <td>#{{ app.applicationId }}</td>
              <td>
                <a [routerLink]="['/jobs', app.jobId]">#{{ app.jobId }}</a>
              </td>
              <td>{{ app.appliedAt | date:'mediumDate' }}</td>
              <td>
                <span class="badge" [ngClass]="statusClass(app.status)">
                  {{ app.status }}
                </span>
              </td>
              <td>{{ app.recruiterNote || '—' }}</td>
              <td>
                <button class="btn btn-sm btn-danger"
                        *ngIf="canWithdraw(app.status)"
                        (click)="withdraw(app)">
                  Withdraw
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state" *ngIf="!loading && applications.length === 0">
        <p>You haven't applied to any jobs yet.</p>
        <a routerLink="/jobs" class="btn btn-primary">Browse Jobs</a>
      </div>
    </div>
  `
})
export class MyApplicationsComponent implements OnInit {
  applications: Application[] = [];
  loading  = false;
  errorMsg = '';

  pipeline = [
    { label: 'Applied',       count: 0 },
    { label: 'Shortlisted',   count: 0 },
    { label: 'Interview',     count: 0 },
    { label: 'Offered',       count: 0 },
    { label: 'Rejected',      count: 0 }
  ];

  constructor(
    private authService: AuthService,
    private jobService: JobService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.jobService.getApplicationsByCandidate(this.authService.getUserId()).subscribe({
      next: apps => {
        this.applications = apps || [];
        this.buildPipeline(this.applications);
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to load applications.';
        this.loading  = false;
      }
    });
  }

  buildPipeline(apps: Application[]): void {
    this.pipeline[0].count = apps.filter(a => a.status === 'APPLIED').length;
    this.pipeline[1].count = apps.filter(a => a.status === 'SHORTLISTED').length;
    this.pipeline[2].count = apps.filter(a => a.status === 'INTERVIEW_SCHEDULED').length;
    this.pipeline[3].count = apps.filter(a => a.status === 'OFFERED').length;
    this.pipeline[4].count = apps.filter(a => a.status === 'REJECTED').length;
  }

  canWithdraw(status?: string): boolean {
    return status !== 'OFFERED' && status !== 'REJECTED';
  }

  withdraw(app: Application): void {
    if (!confirm('Withdraw this application?')) return;
    // BUG FIX: withdrawApplication no longer takes candidateId — backend reads
    // it from the X-User-Id header (JWT-verified) via auth interceptor.
    this.jobService.withdrawApplication(app.applicationId!).subscribe({
      next: () => {
        this.applications = this.applications.filter(
          a => a.applicationId !== app.applicationId);
        this.buildPipeline(this.applications);
      },
      error: err => alert(err.error?.error ?? 'Failed to withdraw.')
    });
  }

  statusClass(status?: string): string {
    const map: any = {
      APPLIED: 'badge-gray',   SHORTLISTED: 'badge-blue',
      INTERVIEW_SCHEDULED: 'badge-yellow',
      OFFERED: 'badge-green',  REJECTED: 'badge-red'
    };
    return map[status ?? ''] ?? 'badge-gray';
  }
}
