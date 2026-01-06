import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, MonthlyBill, PaymentMethod } from '../../services/api.service';

type Step = 1 | 2 | 3;

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="layout">
    <section class="left card">
      <div class="head">
        <h2 class="title">Checkout</h2>
        <button class="btn outline" type="button" (click)="loadBill()" [disabled]="loading">Rafraîchir</button>
      </div>

      <div *ngIf="loading" class="cardbox">Chargement…</div>

      <div *ngIf="error" class="error">
        ⚠️ {{ error }}
      </div>

      <ng-container *ngIf="!loading && !error">

        <!-- SI PAS DE PENDING -->
        <div *ngIf="!billToPay" class="cardbox">
          <strong>Aucune facture <span class="pill">PENDING</span> à payer.</strong>
          <div class="small" style="margin-top:8px;">
            Pour tester : crée une facture <strong>PENDING</strong> (ou vérifie que le flux panier → commande en crée une).
          </div>

          <div class="actions">
            <button class="btn" type="button" (click)="createTestBill()" [disabled]="creatingTestBill">
              {{ creatingTestBill ? 'Création…' : 'Créer facture test' }}
            </button>
            <button class="btn outline" type="button" (click)="loadBill()" [disabled]="loading">Recharger</button>
          </div>

          <div *ngIf="createBillError" class="error" style="margin-top:12px;">
            ⛔ Impossible de créer la facture test (regarde Network/Console).
          </div>
        </div>

        <!-- SI PENDING -->
        <ng-container *ngIf="billToPay">

          <div class="small">
            Facture à payer : <strong>#{{ billToPay.id }}</strong> • status <strong>{{ billToPay.status }}</strong>
          </div>

          <div class="stepper">
            <div class="step" [class.active]="step===1">1. Adresse</div>
            <div class="step" [class.active]="step===2">2. Livraison</div>
            <div class="step" [class.active]="step===3">3. Paiement</div>
          </div>

          <!-- STEP 1 -->
          <div *ngIf="step===1" class="box">
            <h3>Adresse de livraison</h3>

            <div class="grid2">
              <div>
                <label>Nom</label>
                <input class="input" [(ngModel)]="address.fullName" placeholder="Nom complet" />
              </div>
              <div>
                <label>Téléphone</label>
                <input class="input" [(ngModel)]="address.phone" placeholder="06..." />
              </div>
            </div>

            <label>Adresse</label>
            <input class="input" [(ngModel)]="address.line1" placeholder="Rue, numéro..." />

            <div class="grid2">
              <div>
                <label>Ville</label>
                <input class="input" [(ngModel)]="address.city" placeholder="Ville" />
              </div>
              <div>
                <label>Code postal</label>
                <input class="input" [(ngModel)]="address.zip" placeholder="75000" />
              </div>
            </div>

            <div class="actions">
              <button class="btn" type="button" (click)="next()" [disabled]="!validAddress()">Continuer</button>
            </div>
          </div>

          <!-- STEP 2 -->
          <div *ngIf="step===2" class="box">
            <h3>Livraison</h3>

            <div class="ship-options">
              <button type="button" class="opt" [class.selected]="shipping.method==='Standard'" (click)="selectShipping('Standard')">
                <div class="optTitle">Standard</div>
                <div class="optSub">0 € • 3-5 jours</div>
              </button>

              <button type="button" class="opt" [class.selected]="shipping.method==='Express'" (click)="selectShipping('Express')">
                <div class="optTitle">Express</div>
                <div class="optSub">9,90 € • 24-48h</div>
              </button>
            </div>

            <div class="actions">
              <button class="btn outline" type="button" (click)="prev()">Retour</button>
              <button class="btn" type="button" (click)="next()">Continuer</button>
            </div>
          </div>

          <!-- STEP 3 -->
          <div *ngIf="step===3" class="box">
            <h3>Paiement</h3>

            <div class="pay-grid">
              <button type="button" class="opt" [class.selected]="payment.method==='CARD'" (click)="payment.method='CARD'">Carte bancaire</button>
              <button type="button" class="opt" [class.selected]="payment.method==='PAYPAL'" (click)="payment.method='PAYPAL'">PayPal</button>
              <button type="button" class="opt" [class.selected]="payment.method==='BANK_TRANSFER'" (click)="payment.method='BANK_TRANSFER'">Virement</button>
              <button type="button" class="opt" [class.selected]="payment.method==='CASH'" (click)="payment.method='CASH'">Espèces</button>
            </div>

            <!-- CARD -->
            <div class="cardbox" *ngIf="payment.method==='CARD'">
              <div class="grid2">
                <div>
                  <label>Nom sur la carte</label>
                  <input class="input" [(ngModel)]="payment.cardName" placeholder="TEST TEST" />
                </div>
                <div>
                  <label>Numéro de carte (simulation)</label>
                  <input class="input" [(ngModel)]="payment.cardNumber" placeholder="4242 4242 4242 4242" />
                </div>
              </div>
              <div class="grid2">
                <div>
                  <label>Date d’expiration (MM/YY)</label>
                  <input class="input" [(ngModel)]="payment.exp" placeholder="12/29" />
                </div>
                <div>
                  <label>CVV</label>
                  <input class="input" [(ngModel)]="payment.cvv" placeholder="123" />
                </div>
              </div>
            </div>

            <!-- PAYPAL -->
            <div class="cardbox" *ngIf="payment.method==='PAYPAL'">
              <label>Email PayPal (simulation)</label>
              <input class="input" [(ngModel)]="payment.paypalEmail" placeholder="paypal@email.com" />
            </div>

            <!-- BANK TRANSFER -->
            <div class="cardbox" *ngIf="payment.method==='BANK_TRANSFER'">
              <label>IBAN (simulation)</label>
              <input class="input" [(ngModel)]="payment.iban" placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX" />
              <div class="small" style="margin-top:8px;">
                Référence à mettre : <strong>BILL-{{ billToPay.id }}</strong>
              </div>
            </div>

            <div class="actions">
              <button class="btn outline" type="button" (click)="prev()" [disabled]="isPaying">Retour</button>
              <button class="btn" type="button" (click)="confirm()" [disabled]="isPaying || !validPayment()">
                {{ isPaying ? 'Validation du paiement…' : 'Payer et confirmer' }}
              </button>
            </div>

            <div *ngIf="payError" class="error">
              ⛔ Paiement échoué (backend a renvoyé 400/500). Regarde Network.
            </div>
          </div>
        </ng-container>
      </ng-container>
    </section>

    <!-- Summary -->
    <aside class="right card" *ngIf="billForSummary && !loading">
      <div class="head">
        <h3>Résumé</h3>
        <span class="pill">TVA incluse</span>
      </div>

      <div *ngIf="billForSummary.items?.length">
        <div class="row" *ngFor="let it of billForSummary.items">
          <div>
            <div class="itemTitle">{{ it.description }}</div>
            <div class="small">Qté {{ it.quantity }}</div>
          </div>
          <strong>{{ toNumber(it.lineTotal) | number:'1.2-2' }} €</strong>
        </div>
        <hr class="sep" />
      </div>

      <div class="row">
        <span>Sous-total</span>
        <strong>{{ subtotal | number:'1.2-2' }} €</strong>
      </div>

      <div class="row">
        <span>Livraison</span>
        <strong>{{ shipping.price | number:'1.2-2' }} €</strong>
      </div>

      <div class="row">
        <span>TVA (20%)</span>
        <strong>{{ vat | number:'1.2-2' }} €</strong>
      </div>

      <hr class="sep" />

      <div class="row total">
        <span>Total</span>
        <strong>{{ total | number:'1.2-2' }} €</strong>
      </div>

      <div class="actions" style="margin-top:12px;">
        <button class="btn outline full" type="button" (click)="downloadPdf()" [disabled]="downloadingPdf || !billForSummary">
          {{ downloadingPdf ? 'Téléchargement…' : 'Télécharger la facture PDF' }}
        </button>
      </div>

      <div *ngIf="pdfError" class="error" style="margin-top:10px;">
        ⛔ PDF impossible à télécharger.
      </div>
    </aside>
  </div>
  `,
  styles: [`
    .layout{ display:grid; grid-template-columns: 1.1fr .6fr; gap:18px; align-items:start; }
    .card{ background: rgba(255,255,255,.72); border:1px solid rgba(89,50,164,.14); border-radius:22px; padding:22px; box-shadow:0 20px 60px rgba(35,10,90,.10); }
    .head{ display:flex; justify-content:space-between; align-items:center; gap:10px; }
    .title{ margin:0; font-size:56px; line-height:1; letter-spacing:-.03em; }
    .pill{ display:inline-flex; padding:8px 12px; border-radius:999px; font-weight:900; border:1px solid rgba(109,40,217,.25); background: rgba(124,58,237,.08); }
    .stepper{ display:flex; gap:10px; margin: 14px 0 18px; }
    .step{ flex:1; text-align:center; padding:12px; border-radius:14px; background:rgba(255,255,255,.8); border:1px solid rgba(89,50,164,.16); font-weight:900; }
    .step.active{ background: rgba(124,58,237,.12); border-color: rgba(109,40,217,.35); }
    label{ display:block; margin:10px 0 6px; font-weight:900; }
    .grid2{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .actions{ display:flex; gap:12px; margin-top:16px; flex-wrap:wrap; }
    .ship-options{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:10px; }
    .pay-grid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:10px; }
    .opt{ text-align:left; padding:14px; border-radius:16px; background: rgba(255,255,255,.85); border:1px solid rgba(89,50,164,.16); cursor:pointer; font-weight:900; }
    .opt.selected{ border-color: rgba(109,40,217,.55); background: rgba(124,58,237,.10); }
    .optTitle{ font-size:14px; }
    .optSub{ font-size:12px; opacity:.85; font-weight:800; margin-top:4px; }
    .input{ height:44px; padding:0 14px; border-radius:14px; border:1px solid rgba(89,50,164,.18); background: rgba(255,255,255,.85); outline:none; }
    .right{ position: sticky; top: 78px; }
    .row{ display:flex; justify-content:space-between; margin:12px 0; gap:10px; }
    .itemTitle{ font-weight:900; }
    .sep{ border:0; border-top:1px solid rgba(89,50,164,.14); margin:14px 0; }
    .total strong{ font-size:22px; }
    .small{ font-size:12px; opacity:.78; line-height:1.35; }
    .cardbox{ margin-top:14px; padding:14px; border-radius:16px; border:1px dashed rgba(89,50,164,.22); background: rgba(255,255,255,.55); }
    .error{ margin-top:14px; padding:12px; border-radius:14px; background: rgba(239,68,68,.12); border:1px solid rgba(239,68,68,.35); font-weight:800; }
    .btn{ height:44px; padding:0 16px; border-radius:14px; border:1px solid transparent; background: rgba(109,40,217,.95); color:white; font-weight:900; cursor:pointer; }
    .btn:disabled{ opacity:.6; cursor:not-allowed; }
    .btn.outline{ background: transparent; color:#1b1033; border-color: rgba(89,50,164,.22); }
    .btn.full{ width:100%; justify-content:center; }
    @media(max-width: 980px){
      .layout{ grid-template-columns: 1fr; }
      .right{ position:static; }
      .grid2{ grid-template-columns: 1fr; }
      .ship-options, .pay-grid{ grid-template-columns: 1fr; }
      .title{ font-size:40px; }
    }
  `]
})
export class CheckoutPageComponent implements OnInit {
  step: Step = 1;

  loading = false;
  error = '';

  billToPay: MonthlyBill | null = null;
  billForSummary: MonthlyBill | null = null;

  subtotal = 0;
  vat = 0;
  total = 0;

  address = { fullName:'', phone:'', line1:'', city:'', zip:'' };
  shipping = { method: 'Standard' as 'Standard'|'Express', price: 0, eta: '3-5 jours' };

  payment = {
    method: 'CARD' as PaymentMethod,
    cardName: '',
    cardNumber: '',
    exp: '',
    cvv: '',
    paypalEmail: '',
    iban: ''
  };

  isPaying = false;
  payError = false;

  downloadingPdf = false;
  pdfError = false;

  creatingTestBill = false;
  createBillError = false;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadBill();
  }

  toNumber(v: any): number {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') return Number(v.replace(',', '.'));
    return 0;
  }

  private computeFromBill(b: MonthlyBill | null) {
    if (!b) return;
    const itemsSubtotal = (b.items || []).reduce((sum, it) => sum + this.toNumber(it.lineTotal), 0);
    this.subtotal = itemsSubtotal || this.toNumber(b.totalAmount);
    this.recalc();
  }

  loadBill() {
    this.loading = true;
    this.error = '';

    this.api.getBills().subscribe({
      next: (bills) => {
        const sorted = [...(bills ?? [])].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        this.billForSummary = sorted[0] ?? null;
        this.billToPay = sorted.find(b => (b.status || '').toUpperCase() === 'PENDING') ?? null;

        this.computeFromBill(this.billForSummary);

        // Si on a une facture à payer, on veut voir le flow checkout
        if (this.billToPay) this.step = 1;

        this.loading = false;
      },
      error: (err) => {
        console.error('getBills failed', err);
        this.loading = false;
        this.error = 'Impossible de charger /api/bills (backend/proxy?).';
      }
    });
  }

  createTestBill() {
  this.loading = true;
  this.error = '';

  this.api.createTestBill().subscribe({
    next: () => this.loadBill(), // recharge et va trouver la PENDING
    error: (err) => {
      this.loading = false;
      this.error = 'Impossible de créer la facture test. Vérifie que le customerId existe.';
      console.error(err);
    }
  });
}


  recalc() {
    this.vat = +(this.subtotal * 0.20).toFixed(2);
    this.total = +(this.subtotal + this.vat + this.shipping.price).toFixed(2);
  }

  validAddress() {
    return !!this.address.fullName && !!this.address.phone && !!this.address.line1 && !!this.address.city && !!this.address.zip;
  }

  selectShipping(method:'Standard'|'Express') {
    this.shipping.method = method;
    this.shipping.price = method === 'Express' ? 9.90 : 0;
    this.shipping.eta = method === 'Express' ? '24-48h' : '3-5 jours';
    this.recalc();
  }

  validPayment() {
    if (this.payment.method === 'CARD') {
      return this.payment.cardName.trim().length > 2
        && this.payment.cardNumber.replace(/\s/g,'').length >= 12
        && this.payment.exp.trim().length >= 4
        && this.payment.cvv.trim().length >= 3;
    }
    if (this.payment.method === 'PAYPAL') {
      return this.payment.paypalEmail.includes('@');
    }
    if (this.payment.method === 'BANK_TRANSFER') {
      return this.payment.iban.trim().length >= 12;
    }
    // CASH : rien à saisir
    return true;
  }

  next() {
    if (this.step === 1) this.step = 2;
    else if (this.step === 2) this.step = 3;
  }

  prev() {
    if (this.step === 3) this.step = 2;
    else if (this.step === 2) this.step = 1;
  }

  confirm() {
    if (!this.billToPay) return;

    this.isPaying = true;
    this.payError = false;

    this.api.payBill(this.billToPay.id, this.total, this.payment.method).subscribe({
      next: () => {
        this.isPaying = false;
        this.router.navigate(['/confirmation', this.billToPay!.id]);
      },
      error: (err) => {
        console.error('payBill failed', err);
        this.isPaying = false;
        this.payError = true;
      }
    });
  }

  downloadPdf() {
    const b = this.billForSummary;
    if (!b) return;

    this.downloadingPdf = true;
    this.pdfError = false;

    this.api.downloadBillPdf(b.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bill-${b.id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloadingPdf = false;
      },
      error: (err) => {
        console.error('downloadPdf failed', err);
        this.downloadingPdf = false;
        this.pdfError = true;
      }
    });
  }
}
