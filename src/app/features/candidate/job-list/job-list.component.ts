import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { Job } from '../../../core/models/job.model';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Find Your Next Opportunity</h1>
        <p class="subtitle">{{ jobs.length }} jobs available</p>
      </div>

      <!-- Search bar -->
      <div class="search-box">
        <input class="search-input" type="text"
               [(ngModel)]="keyword" placeholder="Job title, skill, or keyword"
               (keyup.enter)="search()" />
        <input class="search-input" type="text"
               [(ngModel)]="location" placeholder="Location"
               (keyup.enter)="search()" />
        <button class="btn btn-primary" (click)="search()">Search</button>
        <button class="btn btn-outline" (click)="clearFilters()">Clear</button>
      </div>

      <!-- Filters row -->
      <div class="filters-row">
        <select class="form-control filter-select" [(ngModel)]="category" (change)="search()">
          <option value="">All Categories</option>
          <option>IT</option><option>Finance</option><option>Marketing</option>
          <option>HR</option><option>Operations</option><option>Sales</option>
          <option>Design</option><option>Legal</option>
        </select>
        <select class="form-control filter-select" [(ngModel)]="type" (change)="search()">
          <option value="">All Types</option>
          <option value="FULL_TIME">Full Time</option>
          <option value="PART_TIME">Part Time</option>
          <option value="CONTRACT">Contract</option>
          <option value="INTERNSHIP">Internship</option>
          <option value="REMOTE">Remote</option>
        </select>
        <select class="form-control filter-select" [(ngModel)]="experience" (change)="search()">
          <option value="">Any Experience</option>
          <option value="0">Fresher</option>
          <option value="1">1+ Years</option>
          <option value="3">3+ Years</option>
          <option value="5">5+ Years</option>
        </select>
      </div>

      <!-- Loading -->
      <div class="loading-spinner" *ngIf="loading">Loading jobs...</div>

      <!-- Job Cards -->
      <div class="job-grid" *ngIf="!loading">
        <div class="job-card" *ngFor="let job of jobs"
             [routerLink]="['/jobs', job.jobId || job['id']]">
          <div class="job-card-header">
            <div>
              <h3 class="job-title">{{ job.title }}</h3>
              <p class="job-company">{{ job.companyName || 'Company' }}</p>
            </div>
            <span class="badge badge-type">{{ job.type | titlecase }}</span>
          </div>
          <div class="job-meta">
            <span class="meta-item"><span class="material-icons" style="font-size: 16px; margin-right: 4px; vertical-align: sub;">location_on</span> {{ job.location }}</span>
            <span class="meta-item"><span class="material-icons" style="font-size: 16px; margin-right: 4px; vertical-align: sub;">work</span> {{ job.category }}</span>
            <span class="meta-item" *ngIf="job.experienceRequired !== undefined">
              <span class="material-icons" style="font-size: 16px; margin-right: 4px; vertical-align: sub;">schedule</span> {{ job.experienceRequired }}+ yrs
            </span>
            <span class="meta-item" *ngIf="job.salaryMin">
              <span class="material-icons" style="font-size: 16px; margin-right: 4px; vertical-align: sub;">payments</span> &#8377; {{ job.salaryMin | number }} – {{ job.salaryMax | number }} LPA
            </span>
          </div>
          <div class="job-skills" *ngIf="job.skills?.length">
            <span class="skill-tag" *ngFor="let s of job.skills.slice(0,4)">{{ s }}</span>
          </div>
          <div class="job-footer">
            <span class="post-date">Posted {{ job.postedAt | date:'mediumDate' }}</span>
            <span class="btn btn-sm btn-primary">View Details</span>
          </div>
        </div>

        <div class="empty-state" *ngIf="!jobs || jobs.length === 0">
          <p>No jobs found matching your criteria.</p>
          <button type="button" class="btn btn-outline" (click)="clearFilters()">Show all jobs</button>
        </div>
      </div>
    </div>
  `
})
export class JobListComponent implements OnInit {
  jobs: Job[] = [];
  loading  = false;
  keyword  = '';
  location = '';
  category = '';
  type     = '';
  experience: any = '';

  constructor(private jobService: JobService) {}

  ngOnInit(): void { this.loadAllJobs(); }

  loadAllJobs(): void {
    this.loading = true;
    this.jobService.getAllActiveJobs().subscribe({
      next: jobs => { this.jobs = jobs || []; this.loading = false; },
      error: ()  => { this.jobs = []; this.loading = false; }
    });
  }

  search(): void {
    this.loading = true;
    const params: any = {};
    if (this.keyword)    params.keyword    = this.keyword;
    if (this.location)   params.location   = this.location;
    if (this.category)   params.category   = this.category;
    if (this.type)       params.type       = this.type;
    if (this.experience) params.experience = this.experience;

    this.jobService.searchJobs(params).subscribe({
      next: jobs => { this.jobs = jobs || []; this.loading = false; },
      error: ()  => { this.jobs = []; this.loading = false; }
    });
  }

  clearFilters(): void {
    this.keyword = ''; this.location = '';
    this.category = ''; this.type = ''; this.experience = '';
    this.loadAllJobs();
  }
}
