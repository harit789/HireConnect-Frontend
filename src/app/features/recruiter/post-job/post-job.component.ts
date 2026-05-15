import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { JobService } from '../../../core/services/job.service';
import { Job } from '../../../core/models/job.model';
import { SubscriptionService } from '../../../core/services/subscription.service';

@Component({
  selector: 'app-post-job',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Post a New Job</h1>
        <a routerLink="/recruiter/dashboard" class="btn btn-outline btn-sm">Back to Dashboard</a>
      </div>

      <div class="alert alert-success" *ngIf="successMsg">{{ successMsg }}</div>
      <div class="alert alert-error"   *ngIf="errorMsg">{{ errorMsg }}</div>

      <!-- Plan Limit Warning -->
      <div class="upgrade-card" *ngIf="limitReached">
        <div class="upgrade-content">
          <span class="material-icons upgrade-icon">warning</span>
          <div class="upgrade-text">
            <h3>Job Limit Reached</h3>
            <p>Your current <strong>{{ currentPlan }}</strong> plan allows up to {{ jobLimit }} job posts. You have already used all of them.</p>
          </div>
          <a routerLink="/recruiter/subscription" class="btn btn-primary">Upgrade Plan</a>
        </div>
      </div>

      <div class="form-card" *ngIf="!limitReached">
        <div class="form-section">
          <h3>Job Information</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Job Title <span class="required">*</span></label>
              <input class="form-control" type="text" [(ngModel)]="job.title"
                     placeholder="e.g. Senior Java Developer" required />
            </div>
            <div class="form-group">
              <label>Company Name <span class="required">*</span></label>
              <input class="form-control" type="text" [(ngModel)]="job.companyName"
                     placeholder="Your company name" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Category <span class="required">*</span></label>
              <select class="form-control" [(ngModel)]="job.category">
                <option value="">Select Category</option>
                <option>IT</option><option>Finance</option><option>Marketing</option>
                <option>HR</option><option>Operations</option><option>Sales</option>
                <option>Design</option><option>Legal</option>
              </select>
            </div>
            <div class="form-group">
              <label>Job Type <span class="required">*</span></label>
              <select class="form-control" [(ngModel)]="job.type">
                <option value="">Select Type</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Location <span class="required">*</span></label>
              <input class="form-control" type="text" [(ngModel)]="job.location"
                     placeholder="e.g. Bangalore, Remote" />
            </div>
            <div class="form-group">
              <label>Experience Required (years)</label>
              <input class="form-control" type="number"
                     [(ngModel)]="job.experienceRequired" min="0" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Salary &amp; Deadline</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Min Salary (LPA)</label>
              <input class="form-control" type="number" [(ngModel)]="job.salaryMin" min="0" />
            </div>
            <div class="form-group">
              <label>Max Salary (LPA)</label>
              <input class="form-control" type="number" [(ngModel)]="job.salaryMax" min="0" />
            </div>
            <div class="form-group">
              <label>Application Deadline</label>
              <input class="form-control" type="date" [(ngModel)]="job.deadline" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Skills &amp; Description</h3>
          <div class="form-group">
            <label>Required Skills (comma separated)</label>
            <input class="form-control" type="text"
                   [ngModel]="skillsStr"
                   (ngModelChange)="updateSkills($event)"
                   placeholder="Java, Spring Boot, MySQL, Docker" />
            <small class="form-hint" *ngIf="job.skills && job.skills.length > 0">
              {{ job.skills.length }} skill(s): {{ job.skills.join(', ') }}
            </small>
          </div>
          <div class="form-group">
            <label>Job Description <span class="required">*</span></label>
            <textarea class="form-control" rows="6"
                       [(ngModel)]="job.description"
                       placeholder="Describe the role, responsibilities, requirements...">
            </textarea>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" (click)="submit()" [disabled]="saving">
            {{ saving ? 'Posting...' : 'Post Job' }}
          </button>
          <button class="btn btn-outline" (click)="reset()" [disabled]="saving">
            Reset
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .upgrade-card {
      background: rgba(255, 193, 7, 0.1);
      border: 1px solid #ffc107;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .upgrade-content {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .upgrade-icon {
      font-size: 48px;
      color: #ffc107;
    }
    .upgrade-text h3 {
      margin: 0 0 8px 0;
      color: #fff;
    }
    .upgrade-text p {
      margin: 0;
      color: #ccc;
    }
    @media (max-width: 600px) {
      .upgrade-content {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class PostJobComponent implements OnInit {
  job: Partial<Job> = { skills: [], type: '', category: '' };
  skillsStr  = '';
  saving     = false;
  successMsg = '';
  errorMsg   = '';
  
  limitReached = false;
  currentPlan = 'FREE';
  jobLimit = 3;

  constructor(
    private authService: AuthService,
    private jobService: JobService,
    private subscriptionService: SubscriptionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkPlanLimit();
  }

  checkPlanLimit(): void {
    const recruiterId = this.authService.getUserId();
    
    // 1. Get active subscription
    this.subscriptionService.getActive(recruiterId).subscribe({
      next: sub => {
        this.currentPlan = sub.plan;
        // 2. Get plan info to know the limit
        this.subscriptionService.getPlanInfo(sub.plan).subscribe({
          next: info => {
            this.jobLimit = info.jobPostLimit === 'Unlimited' ? -1 : info.jobPostLimit;
            
            // 3. Get current job count
            this.jobService.getJobsByRecruiter(recruiterId).subscribe({
              next: jobs => {
                const count = jobs.length;
                if (this.jobLimit !== -1 && count >= this.jobLimit) {
                  this.limitReached = true;
                }
              }
            });
          }
        });
      },
      error: () => {
        // Fallback to FREE plan if no active subscription found
        this.currentPlan = 'FREE';
        this.jobLimit = 3;
        this.jobService.getJobsByRecruiter(recruiterId).subscribe({
          next: jobs => {
            if (jobs.length >= 3) this.limitReached = true;
          }
        });
      }
    });
  }

  updateSkills(val: string): void {
    this.skillsStr = val;
    // BUG FIX: trim each skill and filter empty strings from trailing commas
    this.job.skills = val.split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  submit(): void {
    this.errorMsg = '';

    // Client-side validation
    if (!this.job.title?.trim()) {
      this.errorMsg = 'Job Title is required.'; return;
    }
    if (!this.job.category) {
      this.errorMsg = 'Please select a Category.'; return;
    }
    if (!this.job.type) {
      this.errorMsg = 'Please select a Job Type.'; return;
    }
    if (!this.job.location?.trim()) {
      this.errorMsg = 'Location is required.'; return;
    }
    if (!this.job.description?.trim()) {
      this.errorMsg = 'Job Description is required.'; return;
    }
    if (this.job.salaryMin && this.job.salaryMax &&
        this.job.salaryMin > this.job.salaryMax) {
      this.errorMsg = 'Min salary cannot be greater than Max salary.'; return;
    }

    this.saving = true;

    /**
     * BUG FIX: postedBy is set here for completeness, but the API Gateway's
     * AuthFilter also injects X-User-Id from the validated JWT token, and
     * JobResource always overwrites postedBy from that header — so even if
     * this is omitted, the backend is safe.
     */
    this.job.postedBy = this.authService.getUserId();

    this.jobService.createJob(this.job as Job).subscribe({
      next: () => {
        this.saving     = false;
        this.successMsg = 'Job posted successfully! Redirecting...';
        setTimeout(() => this.router.navigate(['/recruiter/manage-jobs']), 1500);
      },
      error: err => {
        this.saving   = false;
        // Show the exact error from the backend
        this.errorMsg = err.error?.error
          ?? err.error?.message
          ?? `Server error (${err.status}): Failed to post job. Please try again.`;
      }
    });
  }

  reset(): void {
    this.job       = { skills: [], type: '', category: '' };
    this.skillsStr = '';
    this.errorMsg  = '';
    this.successMsg = '';
  }
}
