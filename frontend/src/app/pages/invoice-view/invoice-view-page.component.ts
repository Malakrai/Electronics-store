import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService, MonthlyBill } from '../../services/api.service';

@Component({
  selector: 'app-invoice-view-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="card">
    <div class="top">
      <h2>Invoice #{{ bill?.id }}</h2>
      <div class="actions">
        <a class="btn outline" routerLink="/invoices">Retour</a>
        <button class="btn outline" (click)="download()" [disabled]="!bill">Télécharger PDF</button>
      </div>
    </div>

    <div *ngIf="loading" class="box">Chargement...</div>
    <div *ngIf="error" class="err">⚠️ {{ error }}</div>

    <ng-container *ngIf="bill && !loading">
      <p><strong>Date:</strong> {{ bill.billDate }}</p>
      <p><strong>Client:</strong> {{ bill.customer?.email }}</p>
      <p><strong>Statut:</strong> {{ bill.status }}</p>

      <h3>Items</h3>
      <table class="table" *ngIf="bill.items?.length">
        <thead>
          <tr><th>Description</th><th>Qté</th><th>PU</th><th>Total</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let it of bill.items">
            <td>{{ it.description }}</td>
            <td>{{ it.quantity }}</td>
            <td>{{ toNumber(it.unitPrice) | number:'1.2-2' }} €</td>
            <td>{{ toNumber(it.lineTotal) | number:'1.2-2' }} €</td>
          </tr>
        </tbody>
      </table>

      <div class="total">Total: {{ toNumber(bill.totalAmount) | number:'1.2-2' }} €</div>
    </ng-container>
  </div>
  `,
  styles: [`
    .card{ padding:18px; border-radius:16px; background:white; }
    .top{ display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; }
    .actions{ display:flex; gap:10px; }
    .btn{ height:38px; padding:0 12px; border-radius:12px; border:1px solid transparent; background: rgba(109,40,217,.95); color:white; font-weight:900; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; }
    .btn.outline{ background: transparent; color:#1b1033; border-color: rgba(89,50,164,.28); }
    .box{ padding:12px; border:1px dashed #ddd; border-radius:12px; margin-top:12px;}
    .err{ padding:12px; border-radius:12px; border:1px solid rgba(239,68,68,.35); background: rgba(239,68,68,.10); font-weight:800; margin-top:12px;}
    .table{ width:100%; border-collapse:collapse; margin-top:10px; }
    th, td{ padding:10px 8px; border-bottom:1px solid #eee; text-align:left; font-weight:700; }
    th{ font-size:12px; opacity:.8; }
    .total{ margin-top:14px; font-weight:900; font-size:18px; }
  `]
})
export class InvoiceViewPageComponent implements OnInit {
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
        this.error = 'Impossible de charger la facture.';
      }
    });
  }

  download() {
    if (!this.bill) return;

    this.api.downloadBillPdf(this.bill.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bill-${this.bill!.id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('PDF impossible à télécharger')
    });
  }
}
