import { Routes } from '@angular/router';
import { authGuard, candidateGuard, recruiterGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    pathMatch: 'full' 
  },

  // Auth
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.authRoutes)
  },

  // Public job browsing
  {
    path: 'jobs',
    loadComponent: () =>
      import('./features/candidate/job-list/job-list.component')
        .then(m => m.JobListComponent)
  },
  {
    path: 'jobs/:id',
    loadComponent: () =>
      import('./features/candidate/job-detail/job-detail.component')
        .then(m => m.JobDetailComponent)
  },

  // Candidate routes
  {
    path: 'candidate',
    canActivate: [candidateGuard],
    loadChildren: () =>
      import('./features/candidate/candidate.routes').then(m => m.candidateRoutes)
  },

  // Recruiter routes
  {
    path: 'recruiter',
    canActivate: [recruiterGuard],
    loadChildren: () =>
      import('./features/recruiter/recruiter.routes').then(m => m.recruiterRoutes)
  },

  // Admin routes
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.adminRoutes)
  },

  // OAuth success redirect from backend
  {
    path: 'oauth-success',
    loadComponent: () =>
      import('./features/auth/oauth-success/oauth-success.component')
        .then(m => m.OauthSuccessComponent)
  },

  { path: '**', redirectTo: '/jobs' }
];
