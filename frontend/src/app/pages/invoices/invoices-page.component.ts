import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService, MonthlyBill } from '../../services/api.service';

@Component({
  selector: 'app-invoices-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="card">
    <h2>Invoices</h2>

    <div *ngIf="loading" class="box">Chargement...</div>
    <div *ngIf="error" class="err">
      ⚠️ {{ error }}
      <button class="btn outline" (click)="load()">Réessayer</button>
    </div>

    <div *ngIf="!loading && bills.length === 0" class="box">
      Aucune facture.
    </div>

    <table *ngIf="!loading && bills.length > 0" class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Date</th>
          <th>Client</th>
          <th>Statut</th>
          <th>Total</th>
          <th style="width:260px;">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let b of bills">
          <td>#{{ b.id }}</td>
          <td>{{ b.billDate }}</td>
          <td>{{ b.customer?.email }}</td>
          <td><span class="badge" [attr.data-status]="b.status">{{ b.status }}</span></td>
          <td>{{ toNumber(b.totalAmount) | number:'1.2-2' }} €</td>
          <td class="actions">
            <a class="btn outline" [routerLink]="['/invoices', b.id]">Voir</a>
            <button class="btn outline" (click)="download(b.id)">PDF</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `,
  styles: [`
    .card{ padding:18px; border-radius:16px; background:white; }
    h2{ margin:0 0 14px; }
    .table{ width:100%; border-collapse:collapse; }
    th, td{ padding:10px 8px; border-bottom:1px solid #eee; text-align:left; font-weight:700; }
    th{ font-size:12px; opacity:.8; }
    .actions{ display:flex; gap:10px; }
    .box{ padding:12px; border:1px dashed #ddd; border-radius:12px; }
    .err{ padding:12px; border-radius:12px; border:1px solid rgba(239,68,68,.35); background: rgba(239,68,68,.10); font-weight:800; display:flex; gap:12px; align-items:center; flex-wrap:wrap;}
    .btn{ height:38px; padding:0 12px; border-radius:12px; border:1px solid transparent; background: rgba(109,40,217,.95); color:white; font-weight:900; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; }
    .btn.outline{ background: transparent; color:#1b1033; border-color: rgba(89,50,164,.28); }
    .badge{ padding:4px 10px; border-radius:999px; font-size:12px; }
    .badge[data-status="PAID"]{ background: rgba(22,163,74,.12); color:#166534; }
    .badge[data-status="PENDING"]{ background: rgba(245,158,11,.15); color:#92400e; }
    .badge[data-status="CANCELLED"]{ background: rgba(239,68,68,.12); color:#991b1b; }
  `]
})
export class InvoicesPageComponent implements OnInit {
  bills: MonthlyBill[] = [];
  loading = false;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  toNumber(v: any): number {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') return Number(v.replace(',', '.'));
    return 0;
  }

  load() {
    this.loading = true;
    this.error = '';

    this.api.getBills().subscribe({
      next: (bills) => {
        this.bills = bills || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Impossible de charger les factures.';
      }
    });
  }

  download(id: number) {
    this.api.downloadBillPdf(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bill-${id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('PDF impossible à télécharger')
    });
  }
}
