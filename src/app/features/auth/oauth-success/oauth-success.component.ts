import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-oauth-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <p *ngIf="!error">Signing you in with GitHub...</p>
        <p *ngIf="error" class="alert alert-error">{{ error }}</p>
      </div>
    </div>
  `
})
export class OauthSuccessComponent implements OnInit {
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token  = params['token'];
      const role   = params['role'];
      const userId = params['userId'];

      if (token && role && userId) {
        /**
         * BUG FIX: Use AuthService.saveOAuthSession() instead of writing
         * directly to localStorage. This ensures the isLoggedIn$ BehaviorSubject
         * is updated, keeping the navbar and guards in sync immediately.
         */
        this.authService.saveOAuthSession(token, role, userId);

        if (role === 'CANDIDATE')      this.router.navigate(['/candidate/dashboard']);
        else if (role === 'RECRUITER') this.router.navigate(['/recruiter/dashboard']);
        else if (role === 'ADMIN')     this.router.navigate(['/admin/dashboard']);
        else                           this.router.navigate(['/jobs']);
      } else {
        this.error = 'GitHub login failed — missing session data. Redirecting...';
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      }
    });
  }
}
