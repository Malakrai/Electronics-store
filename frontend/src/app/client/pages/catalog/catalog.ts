import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SearchShared } from '../../../shared/search/search';
import { ProductService } from '../../../services/products';
import { Product } from '../../../models/product';
import { Search } from '../../../services/search';
import { CartService } from '../../../services/cart.service';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchShared ],
  templateUrl: './catalog.html',
  styleUrls: ['./catalog.css']
})
export class Catalog implements OnInit {

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

  constructor(
    private productService: ProductService,
    private searchService: Search,
    private cartService: CartService,
    private router: Router
  ) {

     this.cartCount$ = this.cartService.items$.pipe(
    map(items => items.reduce((sum, i) => sum + i.quantity, 0))
  );
  }


cartCount$!: Observable<number>;


  ngOnInit() {
    this.loadProducts();
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
    let results = [...this.allProducts];
    results = this.applyFilters(results);
    this.filteredProducts = results;
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

  // ✅ Ajout panier (simple)
  addToCart(product: Product) {
    if (!product.id) return;

    this.cartService.addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl
    });

   // alert(`${product.name} ajouté au panier ✅`);
  }

  goToCart() {
    this.router.navigate(['/cart']);
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
