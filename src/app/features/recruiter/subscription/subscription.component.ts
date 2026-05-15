import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { Invoice, Subscription } from '../../../core/models/interview.model';

declare var Razorpay: any;

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Subscription & Billing</h1>
      </div>

      <div class="alert alert-success" *ngIf="successMsg">{{ successMsg }}</div>
      <div class="alert alert-error"   *ngIf="errorMsg">{{ errorMsg }}</div>

      <!-- Current plan -->
      <div class="section">
        <h2>Current Plan</h2>
        <div class="plan-status-card" *ngIf="activeSub">
          <div class="plan-name">{{ activeSub.plan }}</div>
          <div class="plan-meta">
            <span>Started: {{ activeSub.startDate | date:'mediumDate' }}</span>
            <span *ngIf="activeSub.endDate">
              Expires: {{ activeSub.endDate | date:'mediumDate' }}
            </span>
            <span class="badge badge-green">{{ activeSub.status }}</span>
          </div>
          <button class="btn btn-danger btn-sm" (click)="cancel()" [disabled]="processing">
            Cancel Subscription
          </button>
        </div>
        <div class="empty-state" *ngIf="!activeSub && !loadingPlan">
          <p>No active subscription. Choose a plan below.</p>
        </div>
      </div>

      <!-- Plan cards -->
      <div class="section">
        <h2>Available Plans</h2>
        <div class="plans-grid">

          <div class="plan-card" [class.selected-plan]="selectedPlan === 'FREE'">
            <div class="plan-header">
              <h3>Free</h3>
              <div class="plan-price">₹0<span>/mo</span></div>
            </div>
            <ul class="plan-features">
              <li>3 job posts</li>
              <li>Basic dashboard</li>
              <li>Email support</li>
            </ul>
            <button class="btn btn-outline btn-full"
                    (click)="subscribe('FREE', 0)"
                    [disabled]="processing">
              Get Started Free
            </button>
          </div>

          <div class="plan-card plan-popular" [class.selected-plan]="selectedPlan === 'PROFESSIONAL'">
            <div class="plan-badge">Most Popular</div>
            <div class="plan-header">
              <h3>Professional</h3>
              <div class="plan-price">₹999<span>/mo</span></div>
            </div>
            <ul class="plan-features">
              <li>20 job posts/month</li>
              <li>Analytics dashboard</li>
              <li>Candidate messaging</li>
              <li>Priority support</li>
            </ul>
            <div class="form-group" *ngIf="selectedPlan === 'PROFESSIONAL'">
              <label>Payment Mode</label>
              <select class="form-control" [(ngModel)]="paymentMode">
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="NET_BANKING">Net Banking</option>
                <option value="WALLET">Wallet</option>
              </select>
            </div>
            <button class="btn btn-primary btn-full"
                    (click)="selectedPlan === 'PROFESSIONAL' ? subscribe('PROFESSIONAL', 999) : selectPlan('PROFESSIONAL')"
                    [disabled]="processing">
              {{ selectedPlan === 'PROFESSIONAL' ? (processing ? 'Processing...' : 'Confirm ₹999') : 'Subscribe' }}
            </button>
          </div>

          <div class="plan-card" [class.selected-plan]="selectedPlan === 'ENTERPRISE'">
            <div class="plan-header">
              <h3>Enterprise</h3>
              <div class="plan-price">₹4,999<span>/yr</span></div>
            </div>
            <ul class="plan-features">
              <li>Unlimited job posts</li>
              <li>Advanced analytics</li>
              <li>Team management</li>
              <li>API access</li>
              <li>Dedicated account manager</li>
            </ul>
            <div class="form-group" *ngIf="selectedPlan === 'ENTERPRISE'">
              <label>Payment Mode</label>
              <select class="form-control" [(ngModel)]="paymentMode">
                <option value="CARD">Card</option>
                <option value="NET_BANKING">Net Banking</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
            <button class="btn btn-outline btn-full"
                    (click)="selectedPlan === 'ENTERPRISE' ? subscribe('ENTERPRISE', 4999) : selectPlan('ENTERPRISE')"
                    [disabled]="processing">
              {{ selectedPlan === 'ENTERPRISE' ? (processing ? 'Processing...' : 'Confirm ₹4,999') : 'Subscribe' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Invoice history -->
      <div class="section">
        <h2>Invoice History</h2>
        <div class="table-wrap" *ngIf="invoices.length > 0">
          <table class="data-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let inv of invoices">
                <td>#{{ inv.invoiceId }}</td>
                <td>{{ inv.planName }}</td>
                <td>₹{{ inv.amount | number }}</td>
                <td>{{ inv.paymentMode }}</td>
                <td>{{ inv.paymentDate | date:'mediumDate' }}</td>
                <td>
                  <span class="badge badge-green">{{ inv.paymentStatus }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="empty-msg" *ngIf="invoices.length === 0">No invoices yet.</p>
      </div>
    </div>
  `
})
export class SubscriptionComponent implements OnInit {
  activeSub: Subscription | null = null;
  invoices:  Invoice[]           = [];
  loadingPlan = false;
  processing  = false;
  successMsg  = '';
  errorMsg    = '';
  selectedPlan = '';
  paymentMode  = 'UPI';

  constructor(
    private authService: AuthService,
    private subscriptionService: SubscriptionService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const rid = this.authService.getUserId();
    this.loadingPlan = true;
    this.subscriptionService.getActive(rid).subscribe({
      next: sub => { this.activeSub = sub; this.loadingPlan = false; },
      error: ()  => { this.loadingPlan = false; }
    });
    this.subscriptionService.getInvoices(rid).subscribe({
      next: inv => this.invoices = inv,
      error: () => {}
    });
  }

  selectPlan(plan: string): void {
    this.selectedPlan = plan;
  }

  subscribe(plan: string, amount: number): void {
    if (amount === 0) {
      this.processSubscription(plan, amount);
      return;
    }
    
    this.processing = true;
    this.errorMsg   = '';
    
    // 1. Create Razorpay Order
    this.http.post<any>(`${environment.apiUrl}/subscriptions/create-order`, { amount }).subscribe({
      next: (orderStr) => {
        const order = typeof orderStr === 'string' ? JSON.parse(orderStr) : orderStr;
        
        const options = {
          key: "rzp_test_Sk4T4Aq8fiQhdI", // Correct key ID
          amount: order.amount,
          currency: "INR",
          name: "HireConnect",
          description: `Upgrade to ${plan} Plan`,
          order_id: order.id,
          handler: (response: any) => {
             // 2. Verify Payment
             this.verifyPayment(response, plan, amount);
          },
          theme: { color: "#3399cc" }
        };

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', (resp: any) => {
            this.processing = false;
            this.errorMsg = 'Payment failed: ' + resp.error.description;
        });
        rzp.open();
      },
      error: err => {
        this.processing = false;
        this.errorMsg = 'Failed to initialize payment gateway.';
      }
    });
  }

  verifyPayment(response: any, plan: string, amount: number): void {
      this.http.post(`${environment.apiUrl}/subscriptions/verify-payment`, response).subscribe({
          next: () => {
             // 3. Finalize Subscription on our end
             this.processSubscription(plan, amount);
          },
          error: () => {
             this.processing = false;
             this.errorMsg = 'Payment verification failed! Please contact support.';
          }
      });
  }

  private processSubscription(plan: string, amount: number): void {
    const rid = this.authService.getUserId();
    this.subscriptionService.subscribe(rid, plan, this.paymentMode, amount).subscribe({
      next: sub => {
        this.activeSub   = sub;
        this.processing  = false;
        this.selectedPlan = '';
        this.successMsg  = `Successfully subscribed to ${plan} plan!`;
        this.ngOnInit();
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: err => {
        this.processing = false;
        this.errorMsg   = err.error?.error ?? 'Subscription failed.';
      }
    });
  }

  cancel(): void {
    if (!confirm('Cancel your subscription? You will lose access to premium features.')) return;
    this.processing = true;
    this.subscriptionService.cancel(this.authService.getUserId()).subscribe({
      next: () => {
        this.activeSub  = null;
        this.processing = false;
        this.successMsg = 'Subscription cancelled.';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: err => {
        this.processing = false;
        this.errorMsg   = err.error?.error ?? 'Failed to cancel.';
      }
    });
  }
}
