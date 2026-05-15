import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { AuthService } from '../../../core/services/auth.service';
import { Job } from '../../../core/models/job.model';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container" *ngIf="job">
      <a routerLink="/jobs" class="back-link">&#8592; Back to Jobs</a>

      <div class="detail-card">
        <div class="detail-header">
          <div>
            <h1 class="detail-title">{{ job.title }}</h1>
            <p class="detail-company">{{ job.companyName || 'Company' }}</p>
          </div>
          <span class="badge badge-type">{{ job.type }}</span>
        </div>

        <div class="detail-meta">
          <div class="meta-chip"><span class="material-icons" style="font-size: 16px; margin-right: 4px; vertical-align: sub;">location_on</span> {{ job.location }}</div>
          <div class="meta-chip"><span class="material-icons" style="font-size: 16px; margin-right: 4px; vertical-align: sub;">work</span> {{ job.category }}</div>
          <div class="meta-chip" *ngIf="job.experienceRequired !== undefined">
            <span class="material-icons" style="font-size: 16px; margin-right: 4px; vertical-align: sub;">schedule</span> {{ job.experienceRequired }}+ years exp
          </div>
          <div class="meta-chip" *ngIf="job.salaryMin">
            <span class="material-icons" style="font-size: 16px; margin-right: 4px; vertical-align: sub;">payments</span> &#8377; {{ job.salaryMin | number }} – {{ job.salaryMax | number }} LPA
          </div>
          <div class="meta-chip" *ngIf="job.deadline">
            <span class="material-icons" style="font-size: 16px; margin-right: 4px; vertical-align: sub;">event</span> Apply by {{ job.deadline | date:'mediumDate' }}
          </div>
        </div>

        <div class="detail-section">
          <h3>Required Skills</h3>
          <div class="skills-wrap">
            <span class="skill-tag" *ngFor="let s of job.skills">{{ s }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h3>Job Description</h3>
          <p class="job-description">{{ job.description }}</p>
        </div>

        <!-- Apply section -->
        <div class="apply-section" *ngIf="isCandidate">
          <div class="alert alert-success" *ngIf="alreadyApplied">
            You have already applied for this position.
          </div>
          <div class="alert alert-success" *ngIf="applySuccess">
            Application submitted successfully!
          </div>
          <div class="alert alert-error" *ngIf="applyError">{{ applyError }}</div>

          <div *ngIf="!alreadyApplied && !applySuccess">
            <h3>Apply for this position</h3>
            <div class="form-group">
              <label>Cover Letter (optional)</label>
              <textarea class="form-control" rows="4"
                        [(ngModel)]="coverLetter"
                        placeholder="Tell us why you're a great fit..."></textarea>
            </div>
            <div class="form-group">
              <label>Resume URL</label>
              <input class="form-control" type="url"
                     [(ngModel)]="resumeUrl"
                     placeholder="https://your-resume-link.pdf" />
            </div>
            <button class="btn btn-primary" (click)="apply()" [disabled]="applying">
              {{ applying ? 'Submitting...' : 'Submit Application' }}
            </button>
          </div>
        </div>

        <div class="apply-section" *ngIf="!isCandidate">
          <a routerLink="/auth/login" class="btn btn-primary">
            Login as Candidate to Apply
          </a>
        </div>
      </div>
    </div>

    <div class="page-container" *ngIf="!job && !loading">
      <p>Job not found.</p>
      <a routerLink="/jobs" class="btn btn-outline">Back to Jobs</a>
    </div>
    <div class="loading-spinner" *ngIf="loading">Loading...</div>
  `
})
export class JobDetailComponent implements OnInit {
  job: Job | null = null;
  loading       = false;
  isCandidate   = false;
  alreadyApplied= false;
  applySuccess  = false;
  applyError    = '';
  applying      = false;
  coverLetter   = '';
  resumeUrl     = '';

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isCandidate = this.authService.isCandidate();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    this.jobService.getJobById(id).subscribe({
      next: job => {
        this.job = job;
        this.loading = false;
        if (this.isCandidate) this.checkApplied(id);
      },
      error: () => this.loading = false
    });
  }

  checkApplied(jobId: number): void {
    const candidateId = this.authService.getUserId();
    this.jobService.hasApplied(jobId, candidateId).subscribe({
      next: res => this.alreadyApplied = res.applied,
      error: ()  => {}
    });
  }

  apply(): void {
    const jId = this.job?.jobId || (this.job as any)?.id;
    if (!jId) return;
    this.applying  = true;
    this.applyError = '';
    this.jobService.submitApplication({
      jobId: jId,
      candidateId: this.authService.getUserId(),
      coverLetter: this.coverLetter,
      resumeUrl: this.resumeUrl
    }).subscribe({
      next: () => { this.applying = false; this.applySuccess = true; },
      error: err => {
        this.applying  = false;
        this.applyError = err.error?.error ?? 'Failed to submit application.';
      }
    });
  }
}
