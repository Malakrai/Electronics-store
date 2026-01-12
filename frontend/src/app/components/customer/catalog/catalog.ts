import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SearchShared } from '../../../shared/search/search';
import { ProductService } from '../../../services/products';
import { Product } from '../../../models/product';
import { Search } from '../../../services/search';
import { CartService } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';
import { Sidebar } from '../../../shared/sidebar/sidebar';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchShared, Sidebar, RouterModule],
  templateUrl: './catalog.html',
  styleUrls: ['./catalog.css']
})
export class Catalog implements OnInit {
  @ViewChild(Sidebar) sidebar!: Sidebar;

  categories: string[] = [
    'ordinateurs',
    'telephonie',
    'composants',
    'pieces-detachees',
    'systemes-embarques',
    'reseau',
    'audio',
    'video',
    'gaming',
    'connectique',
    'alimentation',
    'outillage',
    'diy',
    'stockage',
    'peripheriques'
  ];

  selectedCategory: string = '';
  selectedPriceRange: string = '';
  filteredProducts: Product[] = [];
  allProducts: Product[] = [];
  searchTerm: string = '';

  cartCount$!: Observable<number>;
  isCustomerLoggedIn: boolean = false;

  constructor(
    private productService: ProductService,
    private searchService: Search,
    private cartService: CartService,
    private router: Router,
    private authService: AuthService
  ) {
    this.cartCount$ = this.cartService.items$.pipe(
      map(items => items.reduce((sum, i) => sum + i.quantity, 0))
    );
  }

  ngOnInit(): void {
    this.loadProducts();
    this.checkIfCustomerLoggedIn();
  }

  checkIfCustomerLoggedIn(): void {
    const user = this.authService.getCurrentUser();
    this.isCustomerLoggedIn = user?.roles?.includes('customer') || false;
  }

  getLoginButtonText(): string {
    if (!this.authService.isAuthenticated()) {
      return 'Connexion';
    }
    const user = this.authService.getCurrentUser();
    return user?.roles?.includes('customer') ? 'Mon Compte' : 'Déconnexion';
  }

  handleLoginButton(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { redirect: 'catalog' } });
      return;
    }

    const user = this.authService.getCurrentUser();
    if (user?.roles?.includes('customer')) {
      this.router.navigate(['/account']);
    } else {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  openSidebar(): void {
    this.sidebar.toggle();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data: Product[]) => {
        this.allProducts = data;
        this.filteredProducts = data;
        this.extractCategories(data);
      },
      error: (err) => console.error('Erreur chargement produits :', err)
    });
  }

  private extractCategories(products: Product[]): void {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    this.categories = uniqueCategories.filter(c => c);
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.applyAllFilters();
  }

  onFiltersChange(filters: any): void {
    this.applyAllFilters();
  }

  applyAllFilters(): void {
    let results = [...this.allProducts];

    if (this.searchTerm) {
      results = this.searchService.searchProducts(this.searchTerm, results);
    }

    if (this.selectedCategory) {
      results = results.filter(p => p.category === this.selectedCategory);
    }

    if (this.selectedPriceRange) {
      results = this.filterByPriceRange(results, this.selectedPriceRange);
    }

    this.filteredProducts = results;
  }

  filterByPriceRange(products: Product[], priceRange: string): Product[] {
    switch (priceRange) {
      case '0-100':
        return products.filter(p => p.price <= 100);
      case '100-500':
        return products.filter(p => p.price > 100 && p.price <= 500);
      case '500-1000':
        return products.filter(p => p.price > 500 && p.price <= 1000);
      case '1000+':
        return products.filter(p => p.price > 1000);
      default:
        return products;
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
  }

  addToCart(product: Product): void {
    if (!product.id) return;

    // Ajouter au panier même sans être connecté
    this.cartService.addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl
    });

    // Message de confirmation
    if (this.isCustomerLoggedIn) {
      alert(`${product.name} a été ajouté au panier !`);
    }
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'En stock',
      'inactif': 'Inactif',
      'rupture': 'Rupture de stock',
      'commande': 'Sur commande'
    };
    return statusMap[status] || status;
  }

  getCategoryDisplayName(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'ordinateurs': 'Ordinateurs & PC',
      'telephonie': 'Téléphonie & Smartphones',
      'composants': 'Composants Électroniques',
      'pieces-detachees': 'Pièces Détachées',
      'systemes-embarques': 'Systèmes Embarqués',
      'reseau': 'Réseau & Communication',
      'audio': 'Audio & Hi-Fi',
      'video': 'Vidéo & TV',
      'gaming': 'Gaming & eSport',
      'connectique': 'Connectique & Câbles',
      'alimentation': 'Alimentation & Batteries',
      'outillage': 'Outillage Électronique',
      'diy': 'DIY & Arduino/Raspberry',
      'stockage': 'Stockage & Mémoire',
      'peripheriques': 'Périphériques'
    };
    return categoryMap[category] || category;
  }
}
