import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'stats',
    loadComponent: () =>
      import('./stats/stats.component').then(m => m.PlatformStatsComponent)
  },
  {
    path: 'jobs',
    loadComponent: () =>
      import('./jobs/jobs.component').then(m => m.AdminJobsComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
