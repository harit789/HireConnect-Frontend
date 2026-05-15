import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './core/services/auth.service';
import { InterviewService } from './core/services/interview.service';
import { SubscriptionService } from './core/services/subscription.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <nav class="navbar">
      <div class="nav-brand">
        <a routerLink="/" class="brand-link">
          <span class="brand-name">HireConnect</span>
        </a>
      </div>

      <div class="nav-links">
        <a routerLink="/jobs" class="nav-link">Browse Jobs</a>

        <ng-container *ngIf="isLoggedIn">
          <!-- Candidate links -->
          <ng-container *ngIf="isCandidate">
            <a routerLink="/candidate/dashboard" class="nav-link">Dashboard</a>
            <a routerLink="/candidate/applications" class="nav-link">My Applications</a>
            <a routerLink="/candidate/interviews" class="nav-link">Interviews</a>

            <a routerLink="/candidate/profile" class="nav-link">My Profile</a>
          </ng-container>

          <!-- Recruiter links -->
          <ng-container *ngIf="isRecruiter">
            <a routerLink="/recruiter/dashboard" class="nav-link">Dashboard</a>
            <a routerLink="/recruiter/post-job" class="nav-link">Post Job</a>
            <a routerLink="/recruiter/analytics" class="nav-link" *ngIf="isProfessional">Analytics</a>

            <a routerLink="/recruiter/profile" class="nav-link">Company Profile</a>
          </ng-container>

          <!-- Admin links -->
          <ng-container *ngIf="isAdmin">
            <a routerLink="/admin/dashboard" class="nav-link">Admin Panel</a>
          </ng-container>

          <!-- Notification bell -->
          <button class="notif-btn" (click)="goToNotifications()">
            <span class="material-icons">notifications</span>
            <span class="badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
          </button>

          <button class="btn btn-outline" (click)="logout()">Logout</button>
        </ng-container>

        <ng-container *ngIf="!isLoggedIn">
          <a routerLink="/auth/login"  class="btn btn-outline">Login</a>
          <a routerLink="/auth/register" class="btn btn-primary">Register</a>
        </ng-container>
      </div>
    </nav>

    <main class="main-content">
      <router-outlet></router-outlet>
    </main>

    <footer class="footer">
      <div class="footer-content">
        <p>&copy; 2026 HireConnect — Bridging Talent with Opportunity</p>
      </div>
    </footer>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  isLoggedIn  = false;
  isCandidate = false;
  isRecruiter = false;
  isAdmin     = false;
  isProfessional = false;
  unreadCount = 0;
  userName    = '';
  currentTheme = 'dark'; // Forced dark theme
  private pollInterval: any;

  constructor(
    private authService: AuthService,
    private interviewService: InterviewService,
    private subscriptionService: SubscriptionService,
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn  = loggedIn;
      this.isCandidate = this.authService.isCandidate();
      this.isRecruiter = this.authService.isRecruiter();
      this.isAdmin     = this.authService.isAdmin();
      
      if (loggedIn) {
        this.loadUnreadCount();
        this.loadUserProfile();
        
        if (this.isRecruiter) {
          this.subscriptionService.getActive(this.authService.getUserId()).subscribe({
            next: (sub) => this.isProfessional = (sub.plan === 'PROFESSIONAL' || sub.plan === 'ENTERPRISE'),
            error: () => this.isProfessional = false
          });
          
          this.subscriptionService.plan$.subscribe(plan => {
            this.isProfessional = (plan === 'PROFESSIONAL' || plan === 'ENTERPRISE');
          });
        }

        // Poll for notifications every 10 seconds
        if (isPlatformBrowser(this.platformId)) {
          if (this.pollInterval) clearInterval(this.pollInterval);
          this.pollInterval = setInterval(() => this.loadUnreadCount(), 10000);
        }
      } else {
        this.userName = '';
        if (this.pollInterval) clearInterval(this.pollInterval);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  loadUnreadCount(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;
    this.interviewService.getUnreadCount(userId).subscribe({
      next: res => this.unreadCount = res.unread,
      error: () => {}
    });
  }

  loadUserProfile(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;
    
    const defaultName = this.authService.getEmail() ? this.authService.getEmail().split('@')[0] : '';
    
    if (this.isCandidate) {
      this.http.get<any>(`${environment.apiUrl}/profile/candidate/user/${userId}`).subscribe({
        next: (p) => this.userName = p.fullName || defaultName || 'Candidate',
        error: () => this.userName = defaultName || 'Candidate'
      });
    } else if (this.isRecruiter) {
      this.http.get<any>(`${environment.apiUrl}/profile/recruiter/user/${userId}`).subscribe({
        next: (p) => this.userName = p.fullName || p.companyName || defaultName || 'Recruiter',
        error: () => this.userName = defaultName || 'Recruiter'
      });
    } else if (this.isAdmin) {
      this.userName = 'Admin';
    }
  }

  goToNotifications(): void {
    const role = this.authService.getRole();
    if (role === 'CANDIDATE') this.router.navigate(['/candidate/notifications']);
    else if (role === 'RECRUITER') this.router.navigate(['/recruiter/notifications']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/jobs']);
  }
}
