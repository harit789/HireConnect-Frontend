import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { InterviewService } from '../../../core/services/interview.service';
import { Interview } from '../../../core/models/interview.model';

@Component({
  selector: 'app-candidate-interviews',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>My Interviews</h1>
        <p class="subtitle">Manage your scheduled interviews</p>
      </div>

      <div class="loading-spinner" *ngIf="loading">Loading...</div>

      <div class="interview-list" *ngIf="!loading">
        <div class="interview-card-full" *ngFor="let iv of interviews">
          <div class="iv-card-header">
            <div>
              <h3>Application #{{ iv.applicationId }}</h3>
              <p class="iv-datetime">{{ iv.scheduledAt | date:'full' }}</p>
            </div>
            <span class="badge" [ngClass]="statusClass(iv.status)">{{ iv.status }}</span>
          </div>

          <div class="iv-card-body">
            <div class="iv-detail">
              <span class="iv-label">Mode:</span>
              <span class="badge badge-type">{{ iv.mode }}</span>
            </div>
            <div class="iv-detail" *ngIf="iv.meetLink">
              <span class="iv-label">Meeting Link:</span>
              <a [href]="iv.meetLink" target="_blank" class="btn btn-sm btn-primary">
                Join Online
              </a>
            </div>
            <div class="iv-detail" *ngIf="iv.location">
              <span class="iv-label">Location:</span>
              <span>{{ iv.location }}</span>
            </div>
            <div class="iv-detail" *ngIf="iv.notes">
              <span class="iv-label">Notes:</span>
              <span>{{ iv.notes }}</span>
            </div>
          </div>

          <div class="iv-card-actions">
            <button class="btn btn-primary btn-sm"
                    *ngIf="iv.status === 'SCHEDULED' || iv.status === 'RESCHEDULED'"
                    (click)="confirm(iv)">
              Confirm
            </button>
            <button class="btn btn-danger btn-sm"
                    *ngIf="iv.status !== 'CANCELLED' && iv.status !== 'COMPLETED'"
                    (click)="cancel(iv)">
              Cancel
            </button>
          </div>
        </div>

        <div class="empty-state" *ngIf="interviews.length === 0">
          <p>No interviews scheduled yet.</p>
        </div>
      </div>
    </div>
  `
})
export class CandidateInterviewsComponent implements OnInit {
  interviews: Interview[] = [];
  loading = false;

  constructor(
    private authService: AuthService,
    private interviewService: InterviewService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const userId = this.authService.getUserId();
    this.interviewService.getByCandidate(userId).subscribe({
      next: ivs => { this.interviews = ivs; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  confirm(iv: Interview): void {
    this.interviewService.confirm(iv.interviewId!).subscribe({
      next: updated => {
        const idx = this.interviews.findIndex(i => i.interviewId === iv.interviewId);
        if (idx > -1) this.interviews[idx] = updated;
      },
      error: err => alert(err.error?.error ?? 'Failed to confirm.')
    });
  }

  cancel(iv: Interview): void {
    if (!confirm('Cancel this interview?')) return;
    this.interviewService.cancel(iv.interviewId!, this.authService.getUserId()).subscribe({
      next: updated => {
        const idx = this.interviews.findIndex(i => i.interviewId === iv.interviewId);
        if (idx > -1) this.interviews[idx] = updated;
      },
      error: err => alert(err.error?.error ?? 'Failed to cancel.')
    });
  }

  statusClass(status?: string): string {
    const map: any = {
      SCHEDULED: 'badge-blue', CONFIRMED: 'badge-green',
      RESCHEDULED: 'badge-yellow', CANCELLED: 'badge-red', COMPLETED: 'badge-gray'
    };
    return map[status ?? ''] ?? 'badge-gray';
  }
}
