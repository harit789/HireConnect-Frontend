import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div style="text-align: center; margin-bottom: 32px;">
          <span class="brand-name" style="font-size: 32px; display: block; margin-bottom: 8px;">HireConnect</span>
          <p class="auth-sub" style="margin-bottom: 0;">Create your account to join the future of hiring.</p>
        </div>

          <div class="alert alert-error"   *ngIf="errorMsg">
            <span class="material-icons">error_outline</span>
            {{ errorMsg }}
          </div>
          
          <form (ngSubmit)="onRegister()">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" class="form-control"
                     [(ngModel)]="fullName" name="fullName"
                     placeholder="John Doe" required />
            </div>

            <div class="form-group">
              <label>Email Address</label>
              <input type="email" class="form-control"
                     [(ngModel)]="email" name="email"
                     placeholder="name@company.com" required />
            </div>

            <div class="form-group">
              <label>Password</label>
              <input type="password" class="form-control"
                     [(ngModel)]="password" name="password"
                     placeholder="At least 8 characters" required minlength="8"/>
            </div>

            <div class="form-group">
              <label>Account Type</label>
              <div class="role-selector">
                <label class="role-option" [class.selected]="role === 'CANDIDATE'">
                  <input type="radio" name="role" value="CANDIDATE"
                         [(ngModel)]="role" />
                  <span class="material-icons role-icon">person_outline</span>
                  <span>Job Seeker</span>
                </label>
                <label class="role-option" [class.selected]="role === 'RECRUITER'">
                  <input type="radio" name="role" value="RECRUITER"
                         [(ngModel)]="role" />
                  <span class="material-icons role-icon">business</span>
                  <span>Recruiter</span>
                </label>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-full" [disabled]="loading">
              <span *ngIf="!loading">Create Account</span>
              <span *ngIf="loading" class="spinner-sm"></span>
              <span *ngIf="loading" style="margin-left: 8px;">Setting things up...</span>
            </button>
          </form>

        <p class="auth-footer">
          Already have an account?
          <a routerLink="/auth/login">Sign in</a>
        </p>
      </div>
    </div>

    <style>
      .spinner-sm {
        width: 18px; height: 18px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        display: inline-block;
        vertical-align: middle;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .otp-input:focus { letter-spacing: 12px; }
    </style>
  `
})
export class RegisterComponent {
  fullName   = '';
  email      = '';
  password   = '';
  role       = 'CANDIDATE';
  step: 'details' = 'details';
  
  loading    = false;
  errorMsg   = '';
  successMsg = '';

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    if (!this.email || !this.password) return;
    this.loading  = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.authService.register({ fullName: this.fullName, email: this.email, password: this.password, role: this.role as any })
      .subscribe({
        next: res => {
          this.loading = false;
          if (res.role === 'CANDIDATE')   this.router.navigate(['/candidate/dashboard']);
          else if (res.role === 'RECRUITER') this.router.navigate(['/recruiter/dashboard']);
          else this.router.navigate(['/']);
        },
        error: err => {
          this.loading  = false;
          this.errorMsg = err.error?.message ?? err.error?.error ?? 'Registration failed. Please try again.';
        }
      });
  }
}
