import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';

interface Job {
  jobId: number;
  title: string;
  company: string;
  location: string;
  category: string;
  type: string;
  status: string;
  postedBy: number;
  salaryMin?: number;
  salaryMax?: number;
  postedAt?: string;
}

@Component({
  selector: 'app-admin-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Manage Jobs</h1>
        <p class="subtitle">View and manage all jobs on the platform</p>
      </div>

      <div class="alert alert-error" *ngIf="errorMsg">{{ errorMsg }}</div>
      <div class="loading-spinner" *ngIf="loading">Loading jobs...</div>

      <div *ngIf="!loading">
        <!-- Filter Bar -->
        <div class="filter-bar" style="display:flex; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap; align-items:center;">
          <button class="btn"
                  [class.btn-primary]="filter === 'ALL'"
                  [class.btn-secondary]="filter !== 'ALL'"
                  (click)="setFilter('ALL')">
            All ({{ jobs.length }})
          </button>
          <button class="btn"
                  [class.btn-primary]="filter === 'ACTIVE'"
                  [class.btn-secondary]="filter !== 'ACTIVE'"
                  (click)="setFilter('ACTIVE')">
            Active ({{ countByStatus('ACTIVE') }})
          </button>
          <button class="btn"
                  [class.btn-primary]="filter === 'CLOSED'"
                  [class.btn-secondary]="filter !== 'CLOSED'"
                  (click)="setFilter('CLOSED')">
            Closed ({{ countByStatus('CLOSED') }})
          </button>

          <input class="form-control" style="max-width:260px; margin-left:auto;"
                 type="text" placeholder="Search by title or company..."
                 [(ngModel)]="searchTerm" />
        </div>

        <!-- Jobs Table -->
        <div class="form-card" style="padding:0; overflow:hidden;">
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="background: var(--surface-2, #1a1a2e); text-align:left;">
                <th style="padding:1rem;">Title</th>
                <th style="padding:1rem;">Company</th>
                <th style="padding:1rem;">Location</th>
                <th style="padding:1rem;">Category</th>
                <th style="padding:1rem;">Status</th>
                <th style="padding:1rem; text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let job of filteredJobs"
                  style="border-top: 1px solid rgba(255,255,255,0.07);">
                <td style="padding:1rem; font-weight:500;">{{ job.title }}</td>
                <td style="padding:1rem; opacity:0.8;">{{ job.company }}</td>
                <td style="padding:1rem; opacity:0.8;">{{ job.location }}</td>
                <td style="padding:1rem; opacity:0.7;">{{ job.category }}</td>
                <td style="padding:1rem;">
                  <span [style.color]="job.status === 'ACTIVE' ? '#22c55e' : '#f87171'">
                    {{ job.status }}
                  </span>
                </td>
                <td style="padding:1rem; text-align:center;">
                  <button class="btn btn-danger"
                          style="font-size:0.8rem; padding:0.35rem 0.85rem;"
                          (click)="deleteJob(job)"
                          [disabled]="deletingId === job.jobId">
                    {{ deletingId === job.jobId ? 'Deleting...' : 'Delete' }}
                  </button>
                </td>
              </tr>
              <tr *ngIf="filteredJobs.length === 0">
                <td colspan="6" style="padding:2rem; text-align:center; opacity:0.5;">
                  No jobs found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminJobsComponent implements OnInit {
  jobs: Job[]       = [];
  loading           = false;
  errorMsg          = '';
  filter            = 'ALL';
  searchTerm        = '';
  deletingId: number | null = null;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Support ?filter=ACTIVE or ?filter=ALL from dashboard links
    this.route.queryParams.subscribe(params => {
      if (params['filter']) {
        this.filter = params['filter'].toUpperCase();
      }
    });
    this.loadJobs();
  }

  loadJobs(): void {
    this.loading  = true;
    this.errorMsg = '';
    this.http.get<Job[]>(`${environment.apiUrl}/jobs`).subscribe({
      next: jobs => {
        this.jobs    = jobs;
        this.loading = false;
      },
      error: () => {
        this.loading  = false;
        this.errorMsg = 'Failed to load jobs.';
      }
    });
  }

  setFilter(f: string): void {
    this.filter = f;
  }

  countByStatus(status: string): number {
    return this.jobs.filter(j => j.status?.toUpperCase() === status).length;
  }

  get filteredJobs(): Job[] {
    let list = this.filter === 'ALL'
      ? this.jobs
      : this.jobs.filter(j => j.status?.toUpperCase() === this.filter);

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(j =>
        j.title?.toLowerCase().includes(term) ||
        j.company?.toLowerCase().includes(term)
      );
    }
    return list;
  }

  deleteJob(job: Job): void {
    if (!confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
    this.deletingId = job.jobId;
    this.http.delete(`${environment.apiUrl}/jobs/${job.jobId}`).subscribe({
      next: () => {
        this.jobs       = this.jobs.filter(j => j.jobId !== job.jobId);
        this.deletingId = null;
      },
      error: () => {
        this.errorMsg   = 'Failed to delete job.';
        this.deletingId = null;
      }
    });
  }
}
