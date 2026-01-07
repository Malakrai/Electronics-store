import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  imports: [CommonModule, FormsModule, SearchShared, Sidebar],
  templateUrl: './catalog.html',
  styleUrls: ['./catalog.css']
})
export class Catalog implements OnInit {
  @ViewChild(Sidebar) sidebar!: Sidebar;

  categories: string[] = [
    'Laptops',
    'Phones',
    'Tablets',
    'Accessoires',
    'Electronique'
  ];

  selectedCategory = '';
  selectedPriceRange = '';
  filteredProducts: Product[] = [];
  allProducts: Product[] = [];
  currentFilters: any = {};
  searchTerm: string = '';

  cartCount$!: Observable<number>;
  isCustomerLoggedIn: boolean = false;

  // Inject services
  constructor(
    private productService: ProductService,
    private searchService: Search,
    private cartService: CartService,
    private router: Router,
    private authService: AuthService
  ) {
    // Calculer le nombre d'items dans le panier
    this.cartCount$ = this.cartService.items$.pipe(
      map(items => items.reduce((sum, i) => sum + i.quantity, 0))
    );
  }

  ngOnInit() {
    this.loadProducts();
    this.checkIfCustomerLoggedIn();
  }

  // Vérifier si un customer est connecté
  checkIfCustomerLoggedIn() {
    if (this.authService.isAuthenticated()) {
      const user = this.authService.getCurrentUser();
      this.isCustomerLoggedIn = user?.roles?.includes('customer') || false;
    } else {
      this.isCustomerLoggedIn = false;
    }
  }

  // Méthode pour vérifier si l'utilisateur a le rôle customer
  isCustomerUser(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.roles?.includes('customer') || false;
  }

  // Méthode pour obtenir le texte du bouton de connexion
  getLoginButtonText(): string {
    if (!this.authService.isAuthenticated()) {
      return 'Se connecter';
    }

    // Vérifier si c'est un customer
    if (this.isCustomerUser()) {
      return 'Mon compte';
    } else {
      return 'Se connecter (compte client)';
    }
  }

  // Gestion du clic sur le bouton de connexion
  handleLoginButton() {
    if (!this.authService.isAuthenticated()) {
      // Non connecté - redirection vers login
      this.router.navigate(['/login'], {
        queryParams: { redirect: 'catalog' }
      });
      return;
    }

    // L'utilisateur est connecté, vérifier son rôle
    if (this.isCustomerUser()) {
      // C'est un customer - redirection vers compte
      this.router.navigateByUrl('/account');
    } else {
      // Ce n'est pas un customer - rediriger vers login pour se connecter en tant que client
      this.authService.logout();

      // Redirection vers login avec message
      this.router.navigate(['/login'], {
        queryParams: {
          redirect: 'catalog',
          message: 'Le catalogue nécessite un compte client. Veuillez vous connecter avec un compte client.'
        }
      });
    }
  }

  openSidebar() {
    this.sidebar.toggle();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.allProducts = data;
        this.filteredProducts = data;
      },
      error: (err) => {
        console.error('Erreur chargement produits :', err);
      }
    });
  }

  onSearch(term: string) {
    this.searchTerm = term;
    const results = this.searchService.searchProducts(term, this.allProducts);
    this.filteredProducts = this.applyFilters(results);
  }

  onFiltersChange(filters: any) {
    this.currentFilters = filters;
    this.applyFiltersToResults();
  }

  applyFiltersToResults() {
    this.filteredProducts = this.applyFilters([...this.allProducts]);
  }

  applyFilters(products: Product[]) {
    let results = [...products];

    if (this.currentFilters.category) {
      results = results.filter(p => p.category === this.currentFilters.category);
    }

    if (this.currentFilters.priceRange) {
      results = this.filterByPriceRange(results, this.currentFilters.priceRange);
    }

    return results;
  }

  filterByPriceRange(products: Product[], priceRange: string) {
    switch (priceRange) {
      case '0-100': return products.filter(p => p.price <= 100);
      case '100-500': return products.filter(p => p.price > 100 && p.price <= 500);
      case '500-1000': return products.filter(p => p.price > 500 && p.price <= 1000);
      case '1000+': return products.filter(p => p.price > 1000);
      default: return products;
    }
  }

  onCategoryChange(category: string) {
    this.selectedCategory = category;
    if (category === 'Tous') {
      this.filteredProducts = [...this.allProducts];
    } else {
      this.filteredProducts = this.allProducts.filter(product => product.category === category);
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  addToCart(product: Product) {
    if (!product.id) return;

    // Vérifier si un customer est connecté
    if (!this.isCustomerUser()) {
      // Rediriger vers login si pas connecté en tant que customer
      alert('Veuillez vous connecter en tant que client pour ajouter des articles au panier');
      this.router.navigate(['/login'], {
        queryParams: {
          redirect: 'catalog',
          message: 'Connectez-vous en tant que client pour ajouter au panier'
        }
      });
      return;
    }

    this.cartService.addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl
    });

    alert(`${product.name} a été ajouté au panier !`);
  }

  goToCart() {
    // Vérifier si un customer est connecté
    if (!this.isCustomerUser()) {
      alert('Veuillez vous connecter en tant que client pour accéder au panier');
      this.router.navigate(['/login'], {
        queryParams: {
          redirect: 'cart',
          message: 'Connectez-vous en tant que client pour voir votre panier'
        }
      });
      return;
    }

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
