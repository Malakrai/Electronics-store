import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ApiService, MonthlyBill } from '../../../services/api.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-magasinier-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  providers: [DatePipe],
  templateUrl: './magasinier-orders.html',
  styleUrls: ['./magasinier-orders.css']
})
export class MagasinierOrders implements OnInit {
  currentUser: User | null = null;
  commandes: any[] = [];
  isLoading = true;
  errorMessage = '';
  recherche: string = '';

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.chargerCommandes();
  }

  chargerCommandes(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getAllBills().subscribe({
      next: (factures: MonthlyBill[]) => {
        this.commandes = this.traiterFactures(factures);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur chargement commandes:', error);
        this.errorMessage = 'Erreur lors du chargement des commandes';
        this.isLoading = false;
      }
    });
  }

  traiterFactures(factures: MonthlyBill[]): any[] {
    return factures.map(facture => ({
      id: facture.id,
      numero: facture.referenceNumber || `CMD-${facture.id}`,
      date: facture.billDate,
      dateFormatee: this.datePipe.transform(facture.billDate, 'dd/MM/yyyy HH:mm'),
      client: facture.customer,
      nomClient: facture.customer ?
        `${facture.customer.firstName} ${facture.customer.lastName}` :
        'Client non spécifié',
      email: facture.customer?.email || '',
      telephone: facture.customer?.phone || '',
      total: facture.totalAmount,
      statutPaiement: facture.status,
      montantPaye: facture.amountPaid || 0,
      montantRestant: facture.totalAmount - (facture.amountPaid || 0),
      articles: facture.items || []
    }));
  }

  getCommandeFiltrees(): any[] {
    if (!this.recherche) return this.commandes;

    const terme = this.recherche.toLowerCase();
    return this.commandes.filter(commande =>
      commande.numero.toLowerCase().includes(terme) ||
      commande.nomClient.toLowerCase().includes(terme) ||
      commande.email.toLowerCase().includes(terme) ||
      commande.id.toString().includes(terme)
    );
  }

  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant);
  }

  getStatutPaiementLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'PAID': '✅ Payée',
      'UNPAID': '❌ Impayée',
      'PENDING': '⏳ En attente',
      'PARTIALLY_PAID': '💰 Partiellement payée'
    };
    return labels[statut?.toUpperCase()] || statut || 'Inconnu';
  }

  getStatutPaiementClasse(statut: string): string {
    const classes: { [key: string]: string } = {
      'PAID': 'badge-success',
      'UNPAID': 'badge-danger',
      'PENDING': 'badge-warning',
      'PARTIALLY_PAID': 'badge-info'
    };
    return classes[statut?.toUpperCase()] || 'badge-secondary';
  }

  rafraichir(): void {
    this.chargerCommandes();
  }
}
