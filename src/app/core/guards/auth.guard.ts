import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.getToken()) return true;
  router.navigate(['/auth/login']);
  return false;
};

export const candidateGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.getToken()) {
    router.navigate(['/auth/login']);
    return false;
  }
  if (auth.isCandidate()) return true;
  /**
   * BUG FIX: If logged in as a different role, redirect to their dashboard
   * instead of the login page to avoid a confusing UX loop where a recruiter
   * clicks a candidate link and gets sent to login (even though they are logged in).
   */
  if (auth.isRecruiter()) { router.navigate(['/recruiter/dashboard']); return false; }
  if (auth.isAdmin())     { router.navigate(['/admin/dashboard']);     return false; }
  router.navigate(['/auth/login']);
  return false;
};

export const recruiterGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.getToken()) {
    router.navigate(['/auth/login']);
    return false;
  }
  if (auth.isRecruiter()) return true;
  if (auth.isCandidate()) { router.navigate(['/candidate/dashboard']); return false; }
  if (auth.isAdmin())     { router.navigate(['/admin/dashboard']);     return false; }
  router.navigate(['/auth/login']);
  return false;
};

export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.getToken()) {
    router.navigate(['/auth/login']);
    return false;
  }
  if (auth.isAdmin()) return true;
  if (auth.isRecruiter()) { router.navigate(['/recruiter/dashboard']); return false; }
  if (auth.isCandidate()) { router.navigate(['/candidate/dashboard']); return false; }
  router.navigate(['/auth/login']);
  return false;
};
