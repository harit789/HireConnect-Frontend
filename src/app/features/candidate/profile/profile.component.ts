import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { CandidateProfile } from '../../../core/models/user.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-candidate-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>My Profile</h1>
      </div>

      <div class="alert alert-success" *ngIf="successMsg">{{ successMsg }}</div>
      <div class="alert alert-error"   *ngIf="errorMsg">{{ errorMsg }}</div>
      <div class="loading-spinner" *ngIf="loading">Loading...</div>

      <ng-container *ngIf="profile as p">
        <div class="form-card" *ngIf="!loading">
          <div class="form-section">
            <h3>Personal Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Full Name</label>
                <input class="form-control" type="text" [(ngModel)]="p.fullName"
                       placeholder="Your full name" />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input class="form-control" type="email" [(ngModel)]="p.email"
                       placeholder="your@email.com" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Mobile</label>
                <input class="form-control" type="number" [(ngModel)]="p.mobile"
                       placeholder="10-digit mobile number" />
              </div>
              <div class="form-group">
                <label>Gender</label>
                <select class="form-control" [(ngModel)]="p.gender">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Date of Birth</label>
                <input class="form-control" type="date" [(ngModel)]="p.dob" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Professional Details</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Experience (years)</label>
                <input class="form-control" type="number" [(ngModel)]="p.experience"
                       min="0" />
              </div>
              <div class="form-group">
                <label>Resume Upload (PDF)</label>
                <input class="form-control" type="file" accept="application/pdf" (change)="uploadResume($event)" />
                <small *ngIf="p.resumeUrl"><a [href]="p.resumeUrl" target="_blank">View Current Resume</a></small>
              </div>
            </div>
            <div class="form-group">
              <label>Skills (comma separated)</label>
              <input class="form-control" type="text"
                     [ngModel]="skillsText"
                     (ngModelChange)="updateSkills($event)"
                     placeholder="Java, Spring Boot, MySQL, Docker" />
              <small class="form-hint" *ngIf="p.skills?.length">
                {{ p.skills.length }} skill(s) added
              </small>
            </div>
            <div class="form-group">
              <label>Professional Summary</label>
              <textarea class="form-control" rows="4"
                        [(ngModel)]="p.summary"
                        placeholder="Brief summary of your professional background...">
              </textarea>
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
export class CandidateProfileComponent implements OnInit {
  profile:   CandidateProfile | null = null;
  loading    = false;
  saving     = false;
  successMsg = '';
  errorMsg   = '';
  isNew      = false;

  constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    this.loading = true;
    this.http.get<CandidateProfile>(`${environment.apiUrl}/profile/candidate/user/${userId}`)
      .subscribe({
        next: p => {
          this.profile = p;
          this.loading = false;
        },
        error: () => {
          this.isNew = true;
          this.loading = false;
          // BUG FIX: email was being set to userId string — now initialised empty
          // so the user fills it in, or pulled from auth if available.
          const user = this.authService.getUser();
          this.profile = {
            userId,
            fullName: '',
            // Auth token doesn't carry email — leave blank for user to fill
            email: '',
            skills: [],
            experience: 0
          } as CandidateProfile;
        }
      });
  }

  get skillsText(): string {
    return this.profile?.skills?.join(', ') || '';
  }

  updateSkills(val: string): void {
    if (this.profile) {
      this.profile.skills = val.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
  }

  save(): void {
    if (!this.profile) return;
    if (!this.profile.fullName?.trim()) {
      this.errorMsg = 'Full name is required.'; return;
    }
    this.saving   = true;
    this.errorMsg = '';
    const userId  = this.authService.getUserId();
    const request = this.isNew
      ? this.http.post<CandidateProfile>(
          `${environment.apiUrl}/profile/candidate`, this.profile)
      : this.http.put<CandidateProfile>(
          `${environment.apiUrl}/profile/candidate/user/${userId}`, this.profile);

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

  uploadResume(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    this.saving = true;
    const formData = new FormData();
    formData.append('file', file);
    const userId = this.authService.getUserId();
    this.http.post<CandidateProfile>(`${environment.apiUrl}/profile/candidate/user/${userId}/resume`, formData)
      .subscribe({
        next: p => {
          this.profile = p;
          this.saving = false;
          this.successMsg = 'Resume uploaded and parsed successfully!';
          setTimeout(() => this.successMsg = '', 3000);
        },
        error: err => {
          this.saving = false;
          this.errorMsg = err.error?.error ?? 'Failed to upload resume.';
        }
      });
  }
}
