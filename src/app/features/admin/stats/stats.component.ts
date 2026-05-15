import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { AnalyticsSummary } from '../../../core/models/interview.model';

@Component({
  selector: 'app-platform-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Platform Statistics</h1>
        <p class="subtitle">Full platform metrics overview</p>
      </div>

      <div class="loading-spinner" *ngIf="loading">Loading...</div>

      <ng-container *ngIf="!loading && stats">
        <div class="metrics-grid">
          <div class="metric-card">
            <span class="metric-label">Total Jobs on Platform</span>
            <span class="metric-value">{{ stats.totalJobsOnPlatform }}</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Active Jobs</span>
            <span class="metric-value">{{ stats.activeJobs }}</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Active Subscriptions</span>
            <span class="metric-value">{{ stats.activeSubscriptions }}</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Total Revenue</span>
            <span class="metric-value">₹{{ stats.totalRevenue | number }}</span>
          </div>
        </div>

        <div class="section">
          <h2>Jobs by Category</h2>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr><th>Category</th><th>Jobs Count</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let entry of categoryEntries">
                  <td>{{ entry[0] }}</td>
                  <td>{{ entry[1] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class PlatformStatsComponent implements OnInit {
  stats: AnalyticsSummary | null = null;
  loading = false;
  categoryEntries: [string, number][] = [];

  constructor(private subscriptionService: SubscriptionService) {}

  ngOnInit(): void {
    this.loading = true;
    this.subscriptionService.getPlatformStats().subscribe({
      next: s => {
        this.stats   = s;
        this.loading = false;
        if (s.jobsByCategory) {
          this.categoryEntries = Object.entries(s.jobsByCategory) as [string, number][];
        }
      },
      error: () => { this.loading = false; }
    });
  }
}
