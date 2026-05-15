import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div style="text-align: center; margin-bottom: 32px;">
          <span class="brand-name" style="font-size: 32px; display: block; margin-bottom: 8px;">HireConnect</span>
          <p class="auth-sub" style="margin-bottom: 0;">Welcome back! Sign in to your account.</p>
        </div>

        <div class="alert alert-error" *ngIf="errorMsg">
          <span class="material-icons">error_outline</span>
          {{ errorMsg }}
        </div>

        <div class="alert alert-success" *ngIf="successMsg">
          <span class="material-icons">check_circle_outline</span>
          {{ successMsg }}
        </div>

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email</label>
            <input type="email" class="form-control"
                   [(ngModel)]="email" name="email"
                   placeholder="you@example.com" required />
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label>Password</label>
            </div>
            <input type="password" class="form-control"
                   [(ngModel)]="password" name="password"
                   placeholder="••••••••" required />
          </div>

          <button type="submit" class="btn btn-primary btn-full" [disabled]="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p class="auth-footer">
          Don't have an account?
          <a routerLink="/auth/register">Register here</a>
        </p>

        <div class="divider"><span>or</span></div>

        <!--
          BUG FIX: The GitHub OAuth link must point to the API Gateway (port 8080)
          which then routes to the user-service OAuth2 initiation endpoint.

          In dev, proxy.conf.json proxies /oauth2 to gateway, so relative URL works.
          In production, use the full gateway URL.

          The href navigates the entire browser window (not an HTTP call) so the
          backend can redirect through GitHub's OAuth flow and back.
        -->
        <a [href]="githubOAuthUrl" class="btn btn-github btn-full">
          <span class="github-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385
                .6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235
                -3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695
                -.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23
                1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605
                -2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225
                -.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405
                3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24
                2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625
                -5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015
                3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </span>
          Continue with GitHub
        </a>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  email    = '';
  password = '';
  loading  = false;
  errorMsg = '';
  successMsg = '';

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['resetSuccess']) {
        this.successMsg = 'Password reset successfully. Please sign in with your new password.';
      }
    });
  }

  get githubOAuthUrl(): string {
    // OAuth2 requires a direct browser navigation to the backend gateway.
    // We cannot use the Angular dev-proxy here because GitHub redirects back
    // to http://localhost:8080/login/oauth2/code/github (the gateway), not to
    // the Angular dev server. So we always use the absolute gateway URL.
    //
    // In dev:  environment.apiUrl = '/api'  → gateway = http://localhost:8080
    // In prod: environment.apiUrl = 'https://api.hireconnect.com/api' → strips correctly
    const apiUrl = environment.apiUrl;
    const gatewayBase = apiUrl.startsWith('/')
      ? 'http://localhost:8080'           // dev: relative URL → use gateway directly
      : apiUrl.replace(/\/api$/, '');     // prod: strip /api suffix
    return `${gatewayBase}/oauth2/authorization/github`;
  }

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.loading  = true;
    this.errorMsg = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: res => {
        this.loading = false;
        if (res.role === 'CANDIDATE')      this.router.navigate(['/candidate/dashboard']);
        else if (res.role === 'RECRUITER') this.router.navigate(['/recruiter/dashboard']);
        else if (res.role === 'ADMIN')     this.router.navigate(['/admin/dashboard']);
        else                               this.router.navigate(['/jobs']);
      },
      error: err => {
        this.loading  = false;
        this.errorMsg = err.error?.error ?? 'Login failed. Please try again.';
      }
    });
  }
}
