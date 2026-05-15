import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly TOKEN_KEY = 'hc_token';
  private readonly USER_KEY  = 'hc_user';

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data)
      .pipe(tap(res => {
        if (res.token) this.saveSession(res);
      }));
  }

  verifyOtp(email: string, otp: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/verify-otp`, { email, otp })
      .pipe(tap(res => this.saveSession(res)));
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, data)
      .pipe(tap(res => this.saveSession(res)));
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/reset-password`, data);
  }


  saveOAuthSession(token: string, role: string, userId: string): void {
    const session: AuthResponse = { token, role, userId, message: 'OAuth login successful' };
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(session));
    this.isLoggedInSubject.next(true);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): AuthResponse | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  getRole(): string {
    return this.getUser()?.role ?? '';
  }

  getUserId(): number {
    return Number(this.getUser()?.userId ?? 0);
  }

  getEmail(): string {
    return this.getUser()?.email ?? '';
  }

  isCandidate(): boolean { return this.getRole() === 'CANDIDATE'; }
  isRecruiter(): boolean { return this.getRole() === 'RECRUITER'; }
  isAdmin():     boolean { return this.getRole() === 'ADMIN'; }

  private saveSession(res: AuthResponse): void {
    if (res.token) {
      localStorage.setItem(this.TOKEN_KEY, res.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(res));
      this.isLoggedInSubject.next(true);
    }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
}
