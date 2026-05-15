import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { JobService } from '../../../core/services/job.service';
import { Job } from '../../../core/models/job.model';

@Component({
  selector: 'app-manage-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Manage Jobs</h1>
        <a routerLink="/recruiter/post-job" class="btn btn-primary">+ Post New Job</a>
      </div>

      <div class="loading-spinner" *ngIf="loading">Loading...</div>
      <div class="alert alert-error" *ngIf="errorMsg">{{ errorMsg }}</div>

      <div class="table-wrap" *ngIf="!loading && jobs.length > 0">
        <table class="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Location</th>
              <th>Type</th>
              <th>Status</th>
              <th>Posted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let job of jobs">
              <td>{{ job.title }}</td>
              <td>{{ job.category }}</td>
              <td>{{ job.location }}</td>
              <td>{{ job.type }}</td>
              <td>
                <span class="badge" [ngClass]="statusClass(job.status)">
                  {{ job.status }}
                </span>
              </td>
              <td>{{ job.postedAt | date:'mediumDate' }}</td>
              <td class="actions-cell">
                <a [routerLink]="['/recruiter/applications', job.jobId || job.id]"
                   class="btn btn-sm btn-outline">Applications</a>
                <button class="btn btn-sm btn-yellow"
                        *ngIf="job.status === 'ACTIVE'"
                        (click)="changeStatus(job, 'PAUSED')">Pause</button>
                <button class="btn btn-sm btn-primary"
                        *ngIf="job.status === 'PAUSED'"
                        (click)="changeStatus(job, 'ACTIVE')">Activate</button>
                <button class="btn btn-sm btn-danger"
                        *ngIf="job.status !== 'CLOSED'"
                        (click)="changeStatus(job, 'CLOSED')">Close</button>
                <button class="btn btn-sm btn-danger"
                        (click)="deleteJob(job)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state" *ngIf="!loading && (!jobs || jobs.length === 0)">
        <p>No jobs posted yet.</p>
        <a routerLink="/recruiter/post-job" class="btn btn-primary">Post your first job</a>
      </div>
    </div>
  `
})
export class ManageJobsComponent implements OnInit {
  jobs: Job[] = [];
  loading  = false;
  errorMsg = '';

  constructor(private authService: AuthService, private jobService: JobService) {}

  ngOnInit(): void {
    this.loading = true;
    this.jobService.getJobsByRecruiter(this.authService.getUserId()).subscribe({
      next: jobs => { this.jobs = jobs || []; this.loading = false; },
      error: ()  => { this.jobs = []; this.loading = false; }
    });
  }

  changeStatus(job: Job, status: string): void {
    const jId = job.jobId || job.id;
    if (!jId) return;
    this.jobService.updateJobStatus(jId, status).subscribe({
      next: updated => {
        const idx = this.jobs.findIndex(j => (j.jobId || j.id) === jId);
        if (idx > -1) this.jobs[idx] = updated;
      },
      error: err => alert(err.error?.error ?? 'Failed to update status.')
    });
  }

  deleteJob(job: Job): void {
    const jId = job.jobId || job.id;
    if (!jId) return;
    if (!confirm(`Delete "${job.title}"? This will also delete all applications.`)) return;
    this.jobService.deleteJob(jId).subscribe({
      next: () => this.jobs = this.jobs.filter(j => (j.jobId || j.id) !== jId),
      error: err => alert(err.error?.error ?? 'Failed to delete job.')
    });
  }

  statusClass(status?: string): string {
    const map: any = { ACTIVE: 'badge-green', PAUSED: 'badge-yellow', CLOSED: 'badge-red' };
    return map[status ?? ''] ?? 'badge-gray';
  }
}
