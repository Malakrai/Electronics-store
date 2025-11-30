/*import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchShared} from '../../../shared/search/search';
import { ProductService} from '../../../services/products';
import { Product} from '../../../models/product';
import { Search } from '../../../services/search';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, Search, SearchShared], 
  templateUrl: './catalog.html',
  styleUrl: './catalog.css'
})
export class Catalog implements OnInit {
  
  categories: string[] = [
    'Tous',
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
  
  selectedCategory = 'Tous';
  filteredProducts: ProductService[] = [];
  allProducts: ProductService[] = [];
  currentFilters: any = {};
  searchTerm: string = '';

  constructor(
    private productService: ProductService,
    private searchService: Search
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe(products => {
      this.allProducts = products;
      this.filteredProducts = products;
      console.log('Produits chargés:', products);
    });
  }

  // Méthodes pour la recherche avancée avec SearchComponent
  onSearch(term: string) {
    this.searchTerm = term;
    let results = this.searchService.searchProducts(term, this.allProducts);
    this.filteredProducts = this.applyFilters(results);
  }

  onFiltersChange(filters: any) {
    this.currentFilters = filters;
    this.applyFiltersToResults();
  }

  applyFiltersToResults() {
    let results = [...this.allProducts];
    results = this.applyFilters(results);
    this.filteredProducts = results;
  }

  applyFilters(products: ProductService[]) {
    let results = [...products];
    
    // Filtre par catégorie
    if (this.currentFilters.category) {
      results = results.filter(p => p.category === this.currentFilters.category);
    }
    
    // Filtre par statut
    if (this.currentFilters.status) {
      results = results.filter(p => p.status === this.currentFilters.status);
    }
    
    // Filtre par prix
    if (this.currentFilters.priceRange) {
      results = this.filterByPriceRange(results, this.currentFilters.priceRange);
    }
    
    return results;
  }

  filterByPriceRange(products: ProductService[], priceRange: string) {
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

  // Ancienne méthode de filtrage simple (optionnelle)
  onCategoryChange(category: string) {
    this.selectedCategory = category;
    
    if (category === 'Tous') {
      this.filteredProducts = [...this.allProducts];
    } else {
      this.filteredProducts = this.allProducts.filter(product => 
        product.category === category
      );
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(price);
  }
  
  addToCart(product: Product) {
    console.log('Produit ajouté au panier:', product);
    alert(`${product.name} ajouté au panier!`);
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'En stock',
      'inactive': 'Inactif', 
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
}*/
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchShared} from '../../../shared/search/search';
import { ProductService} from '../../../services/products';
import { Product} from '../../../models/product';
import { Search } from '../../../services/search';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchShared],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css'
})
export class Catalog implements OnInit {
  
  categories: string[] = [
    'Tous',
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
  
  selectedCategory = 'Tous';
  filteredProducts: Product[] = []; 
  allProducts: Product[] = []; 
  currentFilters: any = {};
  searchTerm: string = '';

  constructor(
    private productService: ProductService,
    private searchService: Search,
    
  ) {}

  ngOnInit() {
    this.loadProducts();
  }
/*
  loadProducts() {
    this.productService.getProducts().subscribe(products => {
      this.allProducts = products;
      this.filteredProducts = products;
      console.log('Produits chargés:', products);
    });
  }
*/

loadProducts() {
  this.productService.getProducts().subscribe({
    next: (data) => {
      this.allProducts = data;
      this.filteredProducts = data;
      console.log('Produits chargés :', data);
    },
    error: (err) => {
      console.error('Erreur chargement produits :', err);
    }
  });
}


  onSearch(term: string) {
    this.searchTerm = term;
    let results = this.searchService.searchProducts(term, this.allProducts);
    this.filteredProducts = this.applyFilters(results);
  }

  onFiltersChange(filters: any) {
    this.currentFilters = filters;
    this.applyFiltersToResults();
  }

  applyFiltersToResults() {
    let results = [...this.allProducts];
    results = this.applyFilters(results);
    this.filteredProducts = results;
  }

  applyFilters(products: Product[]) { 
    let results = [...products];
    
    // Filtre par catégorie
    if (this.currentFilters.category) {
      results = results.filter(p => p.category === this.currentFilters.category);
    }
    
   
    // Filtre par prix
    if (this.currentFilters.priceRange) {
      results = this.filterByPriceRange(results, this.currentFilters.priceRange);
    }
    
    return results;
  }

  filterByPriceRange(products: Product[], priceRange: string) { // Correction: Product[]
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

  // Ancienne méthode de filtrage simple (optionnelle)
  onCategoryChange(category: string) {
    this.selectedCategory = category;
    
    if (category === 'Tous') {
      this.filteredProducts = [...this.allProducts];
    } else {
      this.filteredProducts = this.allProducts.filter(product => 
        product.category === category
      );
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(price);
  }
  
  addToCart(product: Product) { // Correction: Product
    console.log('Produit ajouté au panier:', product);
    alert(`${product.name} ajouté au panier!`);
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'En stock',
      'inactive': 'Inactif', 
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