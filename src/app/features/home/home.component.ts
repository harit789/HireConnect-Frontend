import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container home-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-badges">
            <span class="badge badge-blue">Verified Talent</span>
            <span class="badge badge-green">Real-Time Matches</span>
            <span class="badge badge-type">Global Reach</span>
          </div>
          <h1 class="hero-title">Elevate Your <span>Career</span>.</h1>
          <p class="hero-subtitle">
            Join the ultimate network bridging the gap between visionary companies and top-tier professionals.
          </p>
          <div class="hero-actions">
            <a routerLink="/auth/register" class="btn btn-primary btn-lg">Get Started Today</a>
            <a routerLink="/jobs" class="btn btn-outline btn-lg">Browse Openings</a>
          </div>
        </div>
        
        <div class="hero-card">
          <div class="auth-card-preview">
            <h3>Welcome to HireConnect</h3>
            <p>Access your personalized portal to manage applications and post opportunities.</p>
            <div class="preview-actions">
               <a routerLink="/auth/login" class="btn btn-primary btn-full">Sign In to Dashboard</a>
            </div>
            <div class="social-preview">
               <a href="http://localhost:8080/oauth2/authorization/github" class="btn btn-github btn-full">
                 <img src="assets/github.svg" alt="" style="width: 20px; height: 20px; margin-right: 8px; filter: invert(1);">
                 Continue with GitHub
               </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="stats-section">
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-num">15k+</span>
            <span class="stat-label">Active Roles</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">800+</span>
            <span class="stat-label">Hiring Partners</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">95%</span>
            <span class="stat-label">Match Rate</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">12h</span>
            <span class="stat-label">Avg. Response</span>
          </div>
        </div>
      </section>

      <!-- Roles Section -->
      <section class="roles-section">
        <div class="section-header center">
          <h2>Choose Your Path</h2>
        </div>
        <div class="role-cards">
          <div class="role-card candidate-card">
            <div class="role-icon">👩‍💻</div>
            <h3>For Professionals</h3>
            <p>Build your profile, track applications, and land your dream job with AI-driven matches.</p>
            <a routerLink="/jobs" class="btn btn-outline">Explore Opportunities</a>
          </div>
          <div class="role-card recruiter-card">
            <div class="role-icon">🏢</div>
            <h3>For Companies</h3>
            <p>Post openings, manage interviews, and hire the best talent with our advanced analytics.</p>
            <a routerLink="/auth/register" class="btn btn-primary">Start Hiring</a>
          </div>
        </div>
      </section>

      <!-- Final CTA -->
      <section class="final-cta">
        <div class="cta-content">
          <h2>Ready to Transform Your Future?</h2>
          <p>Join thousands of professionals and top companies already building the future.</p>
          <a routerLink="/auth/register" class="btn btn-primary btn-lg cta-btn">Join HireConnect Now</a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-page {
      padding-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 80px;
    }
    
    /* Hero Section */
    .hero-section {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 60px;
      align-items: center;
      min-height: 70vh;
    }
    .hero-badges {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .hero-title {
      font-size: 64px;
      font-weight: 900;
      line-height: 1.1;
      margin-bottom: 24px;
      color: var(--text-main);
      letter-spacing: -2px;
    }
    .hero-title span {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 20px var(--primary-glow));
    }
    .hero-subtitle {
      font-size: 20px;
      color: var(--text-muted);
      margin-bottom: 40px;
      line-height: 1.6;
      font-weight: 500;
      max-width: 90%;
    }
    .hero-actions {
      display: flex;
      gap: 16px;
    }
    .btn-lg {
      padding: 16px 32px;
      font-size: 18px;
    }

    /* Hero Card (Right) */
    .auth-card-preview {
      background: rgba(24, 24, 27, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 40px;
      backdrop-filter: blur(20px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(37, 99, 235, 0.15);
      animation: float 6s ease-in-out infinite;
    }
    .auth-card-preview h3 {
      font-size: 24px;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 12px;
    }
    .auth-card-preview p {
      color: var(--text-muted);
      margin-bottom: 32px;
      font-size: 15px;
      line-height: 1.5;
    }
    .preview-actions {
      margin-bottom: 16px;
    }
    .btn-github {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
      100% { transform: translateY(0px); }
    }

    /* Stats */
    .stats-section {
      position: relative;
    }

    /* Roles */
    .section-header.center {
      justify-content: center;
      text-align: center;
      border-bottom: none;
      margin-bottom: 40px;
    }
    .section-header.center h2 {
      font-size: 40px;
      background: linear-gradient(135deg, #fff, #a1a1aa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .role-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }
    .role-card {
      background: linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8));
      border: var(--glass-border);
      border-radius: 24px;
      padding: 48px;
      backdrop-filter: var(--glass-filter);
      transition: all 0.4s ease;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    .role-card:hover {
      transform: translateY(-10px);
      border-color: rgba(37, 99, 235, 0.4);
      box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(37, 99, 235, 0.2);
    }
    .role-icon {
      font-size: 64px;
      filter: drop-shadow(0 10px 10px rgba(0,0,0,0.3));
    }
    .role-card h3 {
      font-size: 28px;
      font-weight: 800;
      color: var(--text-main);
    }
    .role-card p {
      color: var(--text-muted);
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 12px;
    }

    /* Final CTA */
    .final-cta {
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(14, 165, 233, 0.2));
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 32px;
      padding: 60px 40px;
      text-align: center;
      backdrop-filter: blur(10px);
      box-shadow: 0 20px 50px rgba(0,0,0,0.3);
      position: relative;
      overflow: hidden;
      margin-bottom: 40px;
    }
    .final-cta::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(circle at center, rgba(37, 99, 235, 0.1) 0%, transparent 70%);
      pointer-events: none;
    }
    .cta-content {
      position: relative;
      z-index: 1;
      max-width: 600px;
      margin: 0 auto;
    }
    .final-cta h2 {
      font-size: 42px;
      font-weight: 900;
      color: #fff;
      margin-bottom: 20px;
      letter-spacing: -1px;
    }
    .final-cta p {
      font-size: 18px;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 40px;
    }
    .cta-btn {
      box-shadow: 0 10px 25px rgba(37, 99, 235, 0.5);
    }
    .cta-btn:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 15px 35px rgba(37, 99, 235, 0.6);
    }

    /* Responsive */
    @media (max-width: 992px) {
      .hero-section {
        grid-template-columns: 1fr;
        text-align: center;
      }
      .hero-badges {
        justify-content: center;
      }
      .hero-subtitle {
        margin: 0 auto 40px;
      }
      .hero-actions {
        justify-content: center;
      }
      .role-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent {}
