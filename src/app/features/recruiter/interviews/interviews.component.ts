import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { InterviewService } from '../../../core/services/interview.service';
import { Interview } from '../../../core/models/interview.model';

@Component({
  selector: 'app-recruiter-interviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Scheduled Interviews</h1>
        <p class="subtitle">{{ interviews.length }} total interviews</p>
      </div>

      <div class="loading-spinner" *ngIf="loading">Loading...</div>
      <div class="alert alert-success" *ngIf="successMsg">{{ successMsg }}</div>
      <div class="alert alert-error"   *ngIf="errorMsg">{{ errorMsg }}</div>

      <div class="interview-list" *ngIf="!loading">
        <div class="interview-card-full" *ngFor="let iv of interviews">
          <div class="iv-card-header">
            <div>
              <h3>Candidate #{{ iv.candidateId }}</h3>
              <p class="iv-datetime">{{ iv.scheduledAt | date:'full' }}</p>
            </div>
            <span class="badge" [ngClass]="statusClass(iv.status)">{{ iv.status }}</span>
          </div>

          <div class="iv-card-body">
            <div class="iv-detail">
              <span class="iv-label">Application:</span>
              <span>#{{ iv.applicationId }}</span>
            </div>
            <div class="iv-detail">
              <span class="iv-label">Mode:</span>
              <span class="badge badge-type">{{ iv.mode }}</span>
            </div>
            <div class="iv-detail" *ngIf="iv.meetLink">
              <span class="iv-label">Meeting Link:</span>
              <a [href]="iv.meetLink" target="_blank" class="btn btn-sm btn-primary">
                Join Meeting
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
            <!--
              BUG FIX: Previously called confirm() for "Mark Complete".
              Now correctly calls the complete() endpoint on the backend.
            -->
            <button class="btn btn-sm btn-green"
                    *ngIf="iv.status === 'CONFIRMED'"
                    (click)="markComplete(iv)">
              Mark Complete
            </button>
            <button class="btn btn-sm btn-yellow"
                    *ngIf="iv.status !== 'CANCELLED' && iv.status !== 'COMPLETED'"
                    (click)="openReschedule(iv)">
              Reschedule
            </button>
            <button class="btn btn-sm btn-danger"
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

      <!-- Reschedule modal -->
      <div class="modal-overlay" *ngIf="showReschedule" (click)="closeReschedule()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <h3>Reschedule Interview</h3>
          <div class="form-group">
            <label>New Date &amp; Time *</label>
            <input class="form-control" type="datetime-local"
                   [(ngModel)]="newScheduledAt" />
          </div>
          <div class="form-group">
            <label>Mode</label>
            <select class="form-control" [(ngModel)]="newMode">
              <option value="ONLINE">Online</option>
              <option value="IN_PERSON">In Person</option>
            </select>
          </div>
          <div class="form-group" *ngIf="newMode === 'ONLINE'">
            <label>New Meeting Link</label>
            <input class="form-control" type="url" [(ngModel)]="newMeetLink"
                   placeholder="https://meet.google.com/..." />
          </div>
          <div class="form-group" *ngIf="newMode === 'IN_PERSON'">
            <label>Location</label>
            <input class="form-control" type="text" [(ngModel)]="newLocation"
                   placeholder="Office address" />
          </div>
          <div class="modal-actions">
            <button class="btn btn-primary" (click)="confirmReschedule()"
                    [disabled]="rescheduling || !newScheduledAt">
              {{ rescheduling ? 'Saving...' : 'Confirm Reschedule' }}
            </button>
            <button class="btn btn-outline" (click)="closeReschedule()">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RecruiterInterviewsComponent implements OnInit {
  interviews: Interview[] = [];
  loading    = false;
  successMsg = '';
  errorMsg   = '';

  showReschedule  = false;
  rescheduling    = false;
  selectedIv: Interview | null = null;
  newScheduledAt  = '';
  newMode         = 'ONLINE';
  newMeetLink     = '';
  newLocation     = '';

  constructor(
    private authService: AuthService,
    private interviewService: InterviewService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.interviewService.getByRecruiter(this.authService.getUserId()).subscribe({
      next: ivs => { this.interviews = ivs; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  markComplete(iv: Interview): void {
    if (!confirm('Mark this interview as completed?')) return;
    // BUG FIX: call the correct complete() method, not confirm()
    this.interviewService.complete(iv.interviewId!).subscribe({
      next: updated => {
        this.replaceIv(updated);
        this.showSuccess('Interview marked as completed.');
      },
      error: err => this.errorMsg = err.error?.error ?? 'Failed to complete.'
    });
  }

  cancel(iv: Interview): void {
    if (!confirm('Cancel this interview?')) return;
    this.interviewService.cancel(iv.interviewId!, this.authService.getUserId()).subscribe({
      next: updated => {
        this.replaceIv(updated);
        this.showSuccess('Interview cancelled.');
      },
      error: err => this.errorMsg = err.error?.error ?? 'Failed to cancel.'
    });
  }

  openReschedule(iv: Interview): void {
    this.selectedIv     = iv;
    this.newScheduledAt = '';
    this.newMode        = iv.mode;
    this.newMeetLink    = iv.meetLink ?? '';
    this.newLocation    = iv.location ?? '';
    this.showReschedule = true;
    this.errorMsg       = '';
  }

  closeReschedule(): void {
    this.showReschedule = false;
    this.selectedIv     = null;
  }

  confirmReschedule(): void {
    if (!this.selectedIv || !this.newScheduledAt) {
      this.errorMsg = 'New date & time is required.'; return;
    }
    this.rescheduling = true;
    this.interviewService.reschedule(this.selectedIv.interviewId!, {
      scheduledAt: this.newScheduledAt,
      mode:        this.newMode as 'ONLINE' | 'IN_PERSON',
      meetLink:    this.newMeetLink || undefined,
      location:    this.newLocation || undefined
    }).subscribe({
      next: updated => {
        this.replaceIv(updated);
        this.rescheduling = false;
        this.closeReschedule();
        this.showSuccess('Interview rescheduled. Candidate notified.');
      },
      error: err => {
        this.rescheduling = false;
        this.errorMsg = err.error?.error ?? 'Failed to reschedule.';
      }
    });
  }

  replaceIv(updated: Interview): void {
    const idx = this.interviews.findIndex(i => i.interviewId === updated.interviewId);
    if (idx > -1) this.interviews[idx] = updated;
  }

  showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => this.successMsg = '', 3000);
  }

  statusClass(status?: string): string {
    const map: any = {
      SCHEDULED: 'badge-blue', CONFIRMED: 'badge-green',
      RESCHEDULED: 'badge-yellow', CANCELLED: 'badge-red', COMPLETED: 'badge-gray'
    };
    return map[status ?? ''] ?? 'badge-gray';
  }
}
