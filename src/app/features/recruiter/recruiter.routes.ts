import { Routes } from '@angular/router';

export const recruiterRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(m => m.RecruiterDashboardComponent)
  },
  {
    path: 'post-job',
    loadComponent: () =>
      import('./post-job/post-job.component').then(m => m.PostJobComponent)
  },
  {
    path: 'manage-jobs',
    loadComponent: () =>
      import('./manage-jobs/manage-jobs.component').then(m => m.ManageJobsComponent)
  },
  {
    path: 'applications/:jobId',
    loadComponent: () =>
      import('./applications/applications.component').then(m => m.RecruiterApplicationsComponent)
  },
  {
    path: 'interviews',
    loadComponent: () =>
      import('./interviews/interviews.component').then(m => m.RecruiterInterviewsComponent)
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('./analytics/analytics.component').then(m => m.AnalyticsComponent)
  },
  {
    path: 'subscription',
    loadComponent: () =>
      import('./subscription/subscription.component').then(m => m.SubscriptionComponent)
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('../candidate/notifications/notifications.component')
        .then(m => m.NotificationsComponent)
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/profile.component').then(m => m.RecruiterProfileComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
