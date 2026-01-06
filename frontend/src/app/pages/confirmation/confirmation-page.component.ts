import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService, MonthlyBill } from '../../services/api.service';

@Component({
  selector: 'app-confirmation-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="card">
    <h2>✅ Confirmation</h2>

    <div *ngIf="loading" class="box">Chargement...</div>
    <div *ngIf="error" class="err">⚠️ {{ error }}</div>

    <ng-container *ngIf="bill && !loading">
      <p>Commande / Facture <strong>#{{ bill.id }}</strong> confirmée.</p>
      <p>Statut: <strong>{{ bill.status }}</strong></p>
      <p>Total: <strong>{{ toNumber(bill.totalAmount) | number:'1.2-2' }} €</strong></p>

      <div class="actions">
        <a class="btn outline" routerLink="/invoices">Voir mes factures</a>
        <a class="btn outline" [routerLink]="['/invoices', bill.id]">Voir cette facture</a>
      </div>
    </ng-container>
  </div>
  `,
  styles: [`
    .card{ padding:18px; border-radius:16px; background:white; }
    .box{ padding:12px; border:1px dashed #ddd; border-radius:12px; margin-top:12px;}
    .err{ padding:12px; border-radius:12px; border:1px solid rgba(239,68,68,.35); background: rgba(239,68,68,.10); font-weight:800; margin-top:12px;}
    .actions{ display:flex; gap:10px; margin-top:12px; flex-wrap:wrap; }
    .btn{ height:38px; padding:0 12px; border-radius:12px; border:1px solid transparent; background: rgba(109,40,217,.95); color:white; font-weight:900; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; }
    .btn.outline{ background: transparent; color:#1b1033; border-color: rgba(89,50,164,.28); }
  `]
})
export class ConfirmationPageComponent implements OnInit {
  bill: MonthlyBill | null = null;
  loading = false;
  error = '';

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('billId'));
    this.load(id);
  }

  toNumber(v: any): number {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') return Number(v.replace(',', '.'));
    return 0;
  }

  load(id: number) {
    this.loading = true;
    this.error = '';

    this.api.getBill(id).subscribe({
      next: (bill) => {
        this.bill = bill;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Impossible de charger la confirmation.';
      }
    });
  }
}
