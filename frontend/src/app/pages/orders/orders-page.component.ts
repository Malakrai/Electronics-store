import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, MonthlyBill } from '../../services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
  <section class="card page">
    <div class="head">
      <div>
        <h1>Mes commandes</h1>
        <p class="muted">Historique (basé sur tes factures).</p>
      </div>
      <input class="input" [(ngModel)]="q" placeholder="Rechercher (id, email, date)..." />
    </div>

    <div *ngIf="loading" class="muted">Chargement…</div>

    <div class="list" *ngIf="!loading">
      <div class="rowCard" *ngFor="let b of filtered()">
        <div class="left">
          <div class="title">Commande #{{ b.id }}</div>
          <div class="meta">{{ b.billDate }} • {{ b.customer.email }}</div>
        </div>
        <div class="right">
          <span class="badge" [class.paid]="b.status==='PAID'" [class.pending]="b.status!=='PAID'">{{ b.status }}</span>
          <strong class="amount">{{ b.totalAmount | number:'1.2-2' }} €</strong>
          <a class="btn outline" [routerLink]="['/invoices', b.id]">Détails</a>
        </div>
      </div>
      <div class="muted" *ngIf="filtered().length===0">Aucune commande.</div>
    </div>
  </section>
  `,
  styles: [`
    .page{ padding:22px; }
    .head{ display:flex; align-items:flex-end; justify-content:space-between; gap:12px; flex-wrap:wrap; }
    h1{ margin:0; }
    .muted{ color:#6b7280; margin:6px 0 0; }
    .list{ margin-top:16px; display:flex; flex-direction:column; gap:10px; }
    .rowCard{
      display:flex; justify-content:space-between; gap:12px;
      padding:14px; border:1px solid #e5e7eb; border-radius:18px;
      background:#fff;
    }
    .title{ font-weight:1000; }
    .meta{ color:#6b7280; font-size:12px; margin-top:4px; }
    .right{ display:flex; align-items:center; gap:10px; }
    .amount{ min-width:110px; text-align:right; }
    .badge{ padding:6px 10px; border-radius:999px; font-weight:900; font-size:12px; border:1px solid #e5e7eb; }
    .badge.paid{ background: rgba(34,197,94,.12); border-color: rgba(34,197,94,.25); }
    .badge.pending{ background: rgba(234,179,8,.12); border-color: rgba(234,179,8,.25); }
  `]
})
export class OrdersPageComponent implements OnInit {
  bills: MonthlyBill[] = [];
  loading = true;
  q = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getBills().subscribe({
      next: (b: MonthlyBill[]) => { this.bills = b ?? []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  filtered(): MonthlyBill[] {
    const q = this.q.trim().toLowerCase();
    return this.bills.filter(b => {
      const hay = `${b.id} ${b.billDate} ${b.customer.email}`.toLowerCase();
      return q ? hay.includes(q) : true;
    });
  }
}
