import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { AnalyticsSummary } from '../../../core/models/interview.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Welcome back! ADMIN</h1>
        <p class="subtitle">Platform-wide overview</p>
      </div>

      <div class="loading-spinner" *ngIf="loading">Loading platform stats...</div>
      <div class="alert alert-error" *ngIf="errorMsg">{{ errorMsg }}</div>

      <ng-container *ngIf="!loading && stats">
        <!-- Platform KPIs -->
        <div class="stats-row">
          <a class="stat-card" routerLink="/admin/jobs" [queryParams]="{filter:'ALL'}"
             style="cursor:pointer; text-decoration:none; display:flex; flex-direction:column; align-items:center;">
            <span class="stat-num">{{ stats.totalJobsOnPlatform }}</span>
            <span class="stat-label">Total Jobs</span>
          </a>
          <a class="stat-card" routerLink="/admin/jobs" [queryParams]="{filter:'ACTIVE'}"
             style="cursor:pointer; text-decoration:none; display:flex; flex-direction:column; align-items:center;">
            <span class="stat-num">{{ stats.activeJobs }}</span>
            <span class="stat-label">Active Jobs</span>
          </a>
          <div class="stat-card">
            <span class="stat-num">{{ stats.activeSubscriptions }}</span>
            <span class="stat-label">Active Subscriptions</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">₹{{ stats.totalRevenue | number }}</span>
            <span class="stat-label">Total Revenue</span>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="quick-actions">
          <a routerLink="/admin/stats" class="action-card">
            <span class="material-icons action-icon">analytics</span>
            <span>Platform Stats</span>
          </a>
          <a routerLink="/jobs" class="action-card">
            <span class="material-icons action-icon">work</span>
            <span>All Jobs</span>
          </a>
        </div>

        <!-- Jobs by Category -->
        <div class="section">
          <h2>Jobs by Category</h2>
          <div class="category-list">
            <div class="category-row"
                 *ngFor="let entry of categoryEntries">
              <span class="cat-name">{{ entry[0] }}</span>
              <div class="cat-bar-track">
                <div class="cat-bar-fill"
                     [style.width.%]="catPct(entry[1])"></div>
              </div>
              <span class="cat-count">{{ entry[1] }}</span>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  stats: AnalyticsSummary | null = null;
  loading  = false;
  errorMsg = '';
  categoryEntries: [string, number][] = [];
  maxCat = 1;

  constructor(private subscriptionService: SubscriptionService) {}

  ngOnInit(): void {
    this.loading = true;
    this.subscriptionService.getPlatformStats().subscribe({
      next: s => {
        this.stats   = s;
        this.loading = false;
        if (s.jobsByCategory) {
          this.categoryEntries = Object.entries(s.jobsByCategory) as [string, number][];
          this.maxCat = Math.max(...this.categoryEntries.map(e => e[1]), 1);
        }
      },
      error: () => {
        this.loading  = false;
        this.errorMsg = 'Failed to load platform stats.';
      }
    });
  }

  catPct(count: number): number {
    return Math.round((count / this.maxCat) * 100);
  }
}
