import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { InterviewService } from '../../../core/services/interview.service';
import { Notification } from '../../../core/models/interview.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Notifications</h1>
        <button class="btn btn-outline btn-sm" (click)="markAll()"
                *ngIf="unread > 0">
          Mark all as read ({{ unread }})
        </button>
      </div>

      <div class="loading-spinner" *ngIf="loading">Loading...</div>
      <div class="alert alert-error" *ngIf="errorMsg">{{ errorMsg }}</div>
      <div class="alert alert-success" *ngIf="successMsg">{{ successMsg }}</div>

      <div class="notif-list" *ngIf="!loading && !errorMsg">
        <div class="notif-item" *ngFor="let n of notifications"
             [class.unread]="!n.isRead"
             (click)="markRead(n)">
          <div class="notif-dot" *ngIf="!n.isRead"></div>
          <div class="notif-content">
            <span class="notif-type">{{ n.type | titlecase }}</span>
            <p class="notif-msg">{{ n.message }}</p>
            <span class="notif-time">{{ n.createdAt | date:'medium' }}</span>
          </div>
        </div>

        <div class="empty-state" *ngIf="notifications.length === 0">
          <p>No notifications yet.</p>
        </div>
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  loading  = false;
  unread   = 0;
  errorMsg = '';
  successMsg = '';
  private pollInterval: any;

  constructor(
    private authService: AuthService,
    private interviewService: InterviewService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.fetchNotifications();
    
    if (isPlatformBrowser(this.platformId)) {
      this.pollInterval = setInterval(() => this.fetchNotifications(), 10000);
    }
  }

  ngOnDestroy(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  fetchNotifications(): void {
    const userId = this.authService.getUserId();
    this.interviewService.getNotifications(userId).subscribe({
      next: notifs => {
        this.notifications = notifs || [];
        this.unread = this.notifications.filter(n => !n.isRead).length;
        this.loading = false;
        this.errorMsg = '';
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.error ?? 'Failed to load notifications.';
      }
    });
  }

  markRead(n: Notification): void {
    if (n.isRead) return;
    this.interviewService.markAsRead(n.notificationId!).subscribe({
      next: () => {
        n.isRead = true;
        this.unread = Math.max(0, this.unread - 1);
      }
    });
  }

  markAll(): void {
    const userId = this.authService.getUserId();
    this.interviewService.markAllRead(userId).subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
        this.unread = 0;
        this.successMsg = 'All marked as read';
        setTimeout(() => this.successMsg = '', 3000);
      }
    });
  }
}
