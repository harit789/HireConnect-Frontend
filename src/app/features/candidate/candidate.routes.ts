import { Routes } from '@angular/router';

export const candidateRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(m => m.CandidateDashboardComponent)
  },
  {
    path: 'applications',
    loadComponent: () =>
      import('./my-applications/my-applications.component').then(m => m.MyApplicationsComponent)
  },
  {
    path: 'interviews',
    loadComponent: () =>
      import('./interviews/interviews.component').then(m => m.CandidateInterviewsComponent)
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./notifications/notifications.component').then(m => m.NotificationsComponent)
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/profile.component').then(m => m.CandidateProfileComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
