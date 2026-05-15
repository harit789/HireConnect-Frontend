import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { InterviewService } from '../../../core/services/interview.service';
import { AuthService } from '../../../core/services/auth.service';

import { SubscriptionService } from '../../../core/services/subscription.service';
import { Application } from '../../../core/models/job.model';
import { Interview } from '../../../core/models/interview.model';

@Component({
  selector: 'app-recruiter-applications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Applications for Job #{{ jobId }}</h1>
        <p class="subtitle">{{ applications.length }} total applicants</p>
      </div>

      <div class="filters-row">
        <select class="form-control filter-select" [(ngModel)]="filterStatus"
                (change)="applyFilter()">
          <option value="">All Statuses</option>
          <option value="APPLIED">Applied</option>
          <option value="SHORTLISTED">Shortlisted</option>
          <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
          <option value="OFFERED">Offered</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>



      <div class="loading-spinner" *ngIf="loading">Loading...</div>
      <div class="alert alert-error"   *ngIf="errorMsg">{{ errorMsg }}</div>
      <div class="alert alert-success" *ngIf="successMsg">{{ successMsg }}</div>

      <div class="table-wrap" *ngIf="!loading && filtered.length > 0">
        <table class="data-table">
          <thead>
            <tr>
              <th>App ID</th>
              <th>Candidate ID</th>
              <th>Applied On</th>
              <th>Resume</th>
              <th>Status</th>
              <th>Recruiter Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let app of filtered">
              <td>#{{ app.applicationId }}</td>
              <td>#{{ app.candidateId }}</td>
              <td>{{ app.appliedAt | date:'mediumDate' }}</td>
              <td>
                <a *ngIf="app.resumeUrl" [href]="app.resumeUrl"
                   target="_blank" class="btn btn-sm btn-outline">
                  View Resume
                </a>
                <span *ngIf="!app.resumeUrl">—</span>
              </td>
              <td>
                <span class="badge" [ngClass]="statusClass(app.status)">
                  {{ app.status }}
                </span>
              </td>
              <td>{{ app.recruiterNote || '—' }}</td>
              <td class="actions-cell">
                <button class="btn btn-sm btn-primary"
                        *ngIf="app.status === 'APPLIED'"
                        (click)="updateStatus(app, 'SHORTLISTED')">
                  Shortlist
                </button>
                <button class="btn btn-sm btn-yellow"
                        *ngIf="app.status === 'SHORTLISTED'"
                        (click)="openSchedule(app)">
                  Schedule Interview
                </button>
                <button class="btn btn-sm btn-green"
                        *ngIf="app.status === 'INTERVIEW_SCHEDULED'"
                        (click)="updateStatus(app, 'OFFERED')">
                  Offer
                </button>

                <button class="btn btn-sm btn-danger"
                        *ngIf="app.status !== 'REJECTED' && app.status !== 'OFFERED'"
                        (click)="updateStatus(app, 'REJECTED')">
                  Reject
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state" *ngIf="!loading && filtered.length === 0">
        <p>No applications found.</p>
      </div>

      <!-- Schedule Interview Modal -->
      <div class="modal-overlay" *ngIf="showSchedule" (click)="closeSchedule()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <h3>Schedule Interview</h3>
          <p>Candidate ID: <strong>#{{ selectedApp?.candidateId }}</strong></p>

          <div class="form-group">
            <label>Date &amp; Time *</label>
            <input class="form-control" type="datetime-local"
                   [(ngModel)]="ivData.scheduledAt" />
          </div>
          <div class="form-group">
            <label>Mode *</label>
            <select class="form-control" [(ngModel)]="ivData.mode">
              <option value="ONLINE">Online</option>
              <option value="IN_PERSON">In Person</option>
            </select>
          </div>
          <div class="form-group" *ngIf="ivData.mode === 'ONLINE'">
            <label>Meeting Link</label>
            <input class="form-control" type="url"
                   [(ngModel)]="ivData.meetLink"
                   placeholder="https://meet.google.com/..." />
          </div>
          <div class="form-group" *ngIf="ivData.mode === 'IN_PERSON'">
            <label>Location</label>
            <input class="form-control" type="text"
                   [(ngModel)]="ivData.location"
                   placeholder="Office address" />
          </div>
          <div class="form-group">
            <label>Candidate Email (for notification)</label>
            <input class="form-control" type="email"
                   [(ngModel)]="ivData.candidateEmail"
                   placeholder="candidate@email.com" />
          </div>
          <div class="form-group">
            <label>Notes for Candidate</label>
            <textarea class="form-control" rows="3"
                      [(ngModel)]="ivData.notes"
                      placeholder="Preparation notes..."></textarea>
          </div>
          <div class="modal-actions">
            <button class="btn btn-primary" (click)="scheduleInterview()"
                    [disabled]="scheduling || !ivData.scheduledAt">
              {{ scheduling ? 'Scheduling...' : 'Schedule Interview' }}
            </button>
            <button class="btn btn-outline" (click)="closeSchedule()">Cancel</button>
          </div>
        </div>
      </div>


    </div>
  `
})
export class RecruiterApplicationsComponent implements OnInit {
  jobId        = 0;
  applications: Application[] = [];
  filtered:     Application[] = [];
  filterStatus  = '';
  loading    = false;
  errorMsg   = '';
  successMsg = '';

  showSchedule  = false;
  scheduling    = false;
  selectedApp: Application | null = null;
  ivData: Partial<Interview> = { mode: 'ONLINE' };

  isProfessional = false;

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private interviewService: InterviewService,
    private authService: AuthService,
    private subscriptionService: SubscriptionService
  ) {}

  ngOnInit(): void {
    this.jobId   = Number(this.route.snapshot.paramMap.get('jobId'));
    this.loading = true;
    this.jobService.getApplicationsByJob(this.jobId).subscribe({
      next: apps => {
        this.applications = apps;
        this.filtered     = apps;
        this.loading      = false;
      },
      error: () => { this.loading = false; }
    });

    this.subscriptionService.getActive(this.authService.getUserId()).subscribe({
      next: sub => this.isProfessional = (sub.plan === 'PROFESSIONAL' || sub.plan === 'ENTERPRISE'),
      error: () => this.isProfessional = false
    });
  }

  applyFilter(): void {
    this.filtered = this.filterStatus
      ? this.applications.filter(a => a.status === this.filterStatus)
      : this.applications;
  }

  updateStatus(app: Application, status: string, note?: string): void {
    this.jobService.updateApplicationStatus(app.applicationId!, status, note).subscribe({
      next: updated => {
        const idx = this.applications.findIndex(a => a.applicationId === app.applicationId);
        if (idx > -1) this.applications[idx] = updated;
        this.applyFilter();
        this.showSuccess(`Status updated to ${status}`);
      },
      error: err => this.errorMsg = err.error?.error ?? 'Failed to update status.'
    });
  }

  openSchedule(app: Application): void {
    this.selectedApp  = app;
    this.ivData       = { mode: 'ONLINE' };
    this.showSchedule = true;
    this.errorMsg     = '';
  }

  closeSchedule(): void {
    this.showSchedule = false;
    this.selectedApp  = null;
  }

  scheduleInterview(): void {
    if (!this.selectedApp || !this.ivData.scheduledAt) {
      this.errorMsg = 'Date & Time is required.'; return;
    }

    const appSnapshot = this.selectedApp;
    this.scheduling = true;
    const interview: Interview = {
      applicationId:  appSnapshot.applicationId!,
      candidateId:    appSnapshot.candidateId,
      recruiterId:    this.authService.getUserId(),
      scheduledAt:    this.ivData.scheduledAt!,
      mode:           this.ivData.mode as 'ONLINE' | 'IN_PERSON',
      meetLink:       this.ivData.meetLink,
      location:       this.ivData.location,
      notes:          this.ivData.notes,
      candidateEmail: this.ivData.candidateEmail
    };
    this.interviewService.schedule(interview).subscribe({
      next: () => {
        this.scheduling = false;
        this.closeSchedule();
        this.updateStatus(appSnapshot, 'INTERVIEW_SCHEDULED');
        this.showSuccess('Interview scheduled! Candidate has been notified.');
      },
      error: err => {
        this.scheduling = false;
        this.errorMsg   = err.error?.error ?? 'Failed to schedule interview.';
      }
    });
  }

  showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => this.successMsg = '', 3000);
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
