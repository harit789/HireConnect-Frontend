import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { RecruiterProfile } from '../../../core/models/user.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-recruiter-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Company Profile - Welcome back! {{ profile?.fullName || '' }}</h1>
        <p class="subtitle">Manage your company details</p>
      </div>

      <div class="alert alert-success" *ngIf="successMsg">{{ successMsg }}</div>
      <div class="alert alert-error"   *ngIf="errorMsg">{{ errorMsg }}</div>
      <div class="loading-spinner" *ngIf="loading">Loading...</div>

      <ng-container *ngIf="profile as p">
        <div class="form-card" *ngIf="!loading">
          <div class="form-section">
            <h3>Personal Details</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Full Name</label>
                <input class="form-control" type="text" [(ngModel)]="p.fullName" placeholder="Your full name" />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input class="form-control" type="email" [(ngModel)]="p.email" placeholder="your@email.com" />
              </div>
              <div class="form-group">
                <label>Designation</label>
                <input class="form-control" type="text" [(ngModel)]="p.designation" placeholder="HR Manager, CTO..." />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Company Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Company Name</label>
                <input class="form-control" type="text" [(ngModel)]="p.companyName" placeholder="Acme Corp" />
              </div>
              <div class="form-group">
                <label>Industry</label>
                <select class="form-control" [(ngModel)]="p.industry">
                  <option value="">Select Industry</option>
                  <option value="IT">IT / Software</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Company Size</label>
                <select class="form-control" [(ngModel)]="p.companySize">
                  <option value="">Select Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>
              <div class="form-group">
                <label>Website</label>
                <input class="form-control" type="url" [(ngModel)]="p.website" placeholder="https://www.example.com" />
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" (click)="save()" [disabled]="saving">
              {{ saving ? 'Saving...' : (isNew ? 'Create Profile' : 'Update Profile') }}
            </button>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class RecruiterProfileComponent implements OnInit {
  profile:   RecruiterProfile | null = null;
  loading    = false;
  saving     = false;
  successMsg = '';
  errorMsg   = '';
  isNew      = false;

  constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    this.loading = true;
    this.http.get<RecruiterProfile>(`${environment.apiUrl}/profile/recruiter/user/${userId}`)
      .subscribe({
        next: p => {
          this.profile = p;
          this.loading = false;
        },
        error: () => {
          this.isNew = true;
          this.loading = false;
          this.profile = {
            userId,
            fullName: '',
            email: '',
            companyName: ''
          } as RecruiterProfile;
        }
      });
  }

  save(): void {
    if (!this.profile) return;
    if (!this.profile.fullName?.trim() || !this.profile.companyName?.trim()) {
      this.errorMsg = 'Full Name and Company Name are required.'; return;
    }
    this.saving   = true;
    this.errorMsg = '';
    const userId  = this.authService.getUserId();
    const request = this.isNew
      ? this.http.post<RecruiterProfile>(`${environment.apiUrl}/profile/recruiter`, this.profile)
      : this.http.put<RecruiterProfile>(`${environment.apiUrl}/profile/recruiter/user/${userId}`, this.profile);

    request.subscribe({
      next: p => {
        this.profile    = p;
        this.saving     = false;
        this.isNew      = false;
        this.successMsg = 'Profile saved successfully!';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: err => {
        this.saving   = false;
        this.errorMsg = err.error?.error ?? 'Failed to save profile.';
      }
    });
  }
}
