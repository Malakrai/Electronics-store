import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService, MonthlyBill } from '../../services/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="card">
        <div class="top">
          <h2>Détail commande / facture</h2>
          <a routerLink="/orders" class="btn outline">← Mes commandes</a>
        </div>

        <div *ngIf="loading" class="muted">Chargement…</div>
        <div *ngIf="error" class="error">❌ Impossible de charger.</div>

        <ng-container *ngIf="bill as b">
          <div class="grid">
            <div>
              <div class="label">Référence</div>
              <div class="value">#{{ b.id }}</div>
            </div>
            <div>
              <div class="label">Date</div>
              <div class="value">{{ b.billDate }}</div>
            </div>
            <div>
              <div class="label">Statut</div>
              <div class="badge">{{ b.status }}</div>
            </div>
            <div>
              <div class="label">Total</div>
              <div class="value strong">{{ b.totalAmount | number:'1.2-2' }} €</div>
            </div>
          </div>

          <h3 class="mt">Articles</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th class="r">Qté</th>
                <th class="r">PU</th>
                <th class="r">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let it of b.items">
                <td>{{ it.description }}</td>
                <td class="r">{{ it.quantity }}</td>
                <td class="r">{{ it.unitPrice | number:'1.2-2' }} €</td>
                <td class="r">{{ it.lineTotal | number:'1.2-2' }} €</td>
              </tr>
            </tbody>
          </table>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .page{ padding:16px; }
    .card{ border-radius:16px; padding:16px; border:1px solid rgba(0,0,0,.08); background:#fff; }
    .top{ display:flex; justify-content:space-between; gap:12px; align-items:center; flex-wrap:wrap; }
    .btn{ padding:10px 12px; border-radius:12px; border:1px solid rgba(90,24,154,.35); background: rgba(124,58,237,.10); font-weight:800; cursor:pointer; text-decoration:none; color:#111; }
    .btn.outline{ background:#fff; }
    .muted{ opacity:.7; margin-top:10px; }
    .error{ margin-top:12px; padding:10px; border-radius:12px; background:#fee2e2; border:1px solid #ef4444; font-weight:800; }
    .grid{ display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; margin-top:12px; }
    .label{ font-size:12px; opacity:.7; font-weight:800; }
    .value{ font-weight:800; }
    .strong{ font-size:18px; }
    .badge{ display:inline-block; padding:6px 10px; border-radius:999px; background: rgba(124,58,237,.12); border:1px solid rgba(124,58,237,.25); font-weight:900; }
    .mt{ margin-top:16px; }
    .table{ width:100%; border-collapse:collapse; margin-top:10px; }
    th, td{ padding:10px; border-bottom:1px solid rgba(0,0,0,.08); }
    .r{ text-align:right; }
    @media (max-width: 900px){ .grid{ grid-template-columns: 1fr 1fr; } }
  `]
})
export class OrderDetailsPageComponent implements OnInit {
  orderId = 0;
  bill: MonthlyBill | null = null;
  loading = false;
  error = false;

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('orderId') ?? 0);
    this.load();
  }

  load(): void {
    if (!this.orderId) { this.error = true; return; }
    this.loading = true;
    this.api.getBill(this.orderId).subscribe({
      next: (b: MonthlyBill) => { this.bill = b; this.loading = false; },
      error: () => { this.loading = false; this.error = true; }
    });
  }
}
