import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { AnalyticsSummary } from '../../../core/models/interview.model';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Hiring Analytics</h1>
        <p class="subtitle">Performance metrics for your job postings</p>
      </div>

      <div class="loading-spinner" *ngIf="loading">Loading analytics...</div>
      <div class="alert alert-error" *ngIf="errorMsg">{{ errorMsg }}</div>

      <ng-container *ngIf="!loading && stats">
        <!-- Top KPIs -->
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-num">{{ stats.totalJobsPosted }}</span>
            <span class="stat-label">Total Jobs Posted</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">{{ stats.activeJobs }}</span>
            <span class="stat-label">Active Jobs</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">{{ stats.totalApplications }}</span>
            <span class="stat-label">Total Applications</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">{{ stats.viewToApplyRatio }}</span>
            <span class="stat-label">Apps per Job</span>
          </div>
        </div>

        <!-- Pipeline breakdown -->
        <div class="section">
          <h2>Application Pipeline</h2>
          <div class="pipeline-analytics">
            <div class="pipeline-bar-item" *ngFor="let item of pipelineItems">
              <div class="pba-label">{{ item.label }}</div>
              <div class="pba-track">
                <div class="pba-fill" [style.width.%]="item.pct"
                     [ngClass]="item.colorClass"></div>
              </div>
              <div class="pba-count">{{ item.count }}</div>
            </div>
          </div>
        </div>

        <!-- Secondary metrics -->
        <div class="metrics-grid">
          <div class="metric-card">
            <span class="metric-label">Offer Acceptance Rate</span>
            <span class="metric-value">{{ stats.offerAcceptanceRate }}%</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Shortlisted</span>
            <span class="metric-value">{{ stats.shortlistedCount }}</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Interviews Scheduled</span>
            <span class="metric-value">{{ stats.interviewScheduledCount }}</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Offered</span>
            <span class="metric-value">{{ stats.offeredCount }}</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Rejected</span>
            <span class="metric-value">{{ stats.rejectedCount }}</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Closed Jobs</span>
            <span class="metric-value">{{ stats.closedJobs }}</span>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class AnalyticsComponent implements OnInit {
  stats: AnalyticsSummary | null = null;
  loading  = false;
  errorMsg = '';

  pipelineItems: any[] = [];

  constructor(
    private authService: AuthService,
    private subscriptionService: SubscriptionService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const recruiterId = this.authService.getUserId();
    this.subscriptionService.getRecruiterStats(recruiterId).subscribe({
      next: s => {
        this.stats   = s;
        this.loading = false;
        this.buildPipeline(s);
      },
      error: () => {
        this.loading  = false;
        this.errorMsg = 'Failed to load analytics.';
      }
    });
  }

  buildPipeline(s: AnalyticsSummary): void {
    const total = s.totalApplications || 1;
    this.pipelineItems = [
      { label: 'Applied',              count: (s.applicationsByStatus?.['APPLIED'] ?? 0),             pct: ((s.applicationsByStatus?.['APPLIED'] ?? 0) / total * 100), colorClass: 'fill-gray' },
      { label: 'Shortlisted',          count: s.shortlistedCount ?? 0,           pct: ((s.shortlistedCount ?? 0) / total * 100),          colorClass: 'fill-blue' },
      { label: 'Interview Scheduled',  count: s.interviewScheduledCount ?? 0,    pct: ((s.interviewScheduledCount ?? 0) / total * 100),   colorClass: 'fill-yellow' },
      { label: 'Offered',              count: s.offeredCount ?? 0,               pct: ((s.offeredCount ?? 0) / total * 100),              colorClass: 'fill-green' },
      { label: 'Rejected',             count: s.rejectedCount ?? 0,              pct: ((s.rejectedCount ?? 0) / total * 100),             colorClass: 'fill-red' }
    ];
  }
}
