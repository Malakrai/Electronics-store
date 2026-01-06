import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FakeApi } from '../../core/api';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <section class="card">
    <div class="card__hd">
      <div>
        <h1 class="h1">Moyens de paiement</h1>
        <p class="sub">On n’enregistre jamais le numéro complet ni le CVV : uniquement token + last4 + brand.</p>
      </div>
      <button class="btn primary" (click)="showAdd=!showAdd">➕ Ajouter une carte</button>
    </div>

    <div class="card__bd">
      <div *ngFor="let pm of methods" class="card" style="margin-bottom:10px;">
        <div class="card__bd" style="display:flex; justify-content:space-between; gap:10px; align-items:center;">
          <div>
            <div style="font-weight:900">{{pm.brand || pm.type}} • **** {{pm.last4 || '—'}}</div>
            <div class="sub">Exp: {{pm.expMonth}}/{{pm.expYear}} • Token: {{pm.token}}</div>
            <span class="badge green" *ngIf="pm.isDefault">Par défaut</span>
          </div>

          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button class="btn" (click)="setDefault(pm.id)" [disabled]="pm.isDefault">Définir par défaut</button>
            <button class="btn danger" (click)="remove(pm.id)">Supprimer</button>
          </div>
        </div>
      </div>

      <p class="sub" *ngIf="methods.length===0">Aucun moyen de paiement.</p>

      <div *ngIf="showAdd" class="card" style="margin-top:14px;">
        <div class="card__hd"><strong>Ajouter une carte</strong></div>
        <div class="card__bd">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div class="field"><label>Marque</label>
              <select [(ngModel)]="brand">
                <option>VISA</option>
                <option>MASTERCARD</option>
              </select>
            </div>
            <div class="field"><label>Last4</label><input [(ngModel)]="last4" placeholder="4242"/></div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div class="field"><label>Mois</label><input type="number" [(ngModel)]="expMonth" /></div>
            <div class="field"><label>Année</label><input type="number" [(ngModel)]="expYear" /></div>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:10px;">
            <button class="btn" (click)="showAdd=false">Annuler</button>
            <button class="btn primary" (click)="add()">Enregistrer</button>
          </div>
        </div>
      </div>
    </div>
  </section>
  `,
})
export class PaymentMethodsPageComponent {
  showAdd = false;
  brand = 'VISA';
  last4 = '4242';
  expMonth = 12;
  expYear = 2028;

  constructor(private api: FakeApi){}

  get methods(){ return this.api.getPaymentMethods(); }

  add(){
    if(!this.last4 || this.last4.length !== 4) return;
    this.api.addCard({ brand: this.brand, last4: this.last4, expMonth: this.expMonth, expYear: this.expYear });
    this.showAdd = false;
  }
  remove(id:number){ this.api.removePaymentMethod(id); }
  setDefault(id:number){ this.api.setDefaultPaymentMethod(id); }
}
