/*import { Component, OnInit} from '@angular/core';
import { Products } from '../../../services/products';
import { Product } from '../../../models/product';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-catalog',
  imports: [CommonModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
})
export class Catalog {
  products: Product[] = [
    
  ];
  filteredProducts: Product[] = [];
  categories: string[] = [//pour les tests
    'Tous', 'Électronique', 'Informatique', 'Téléphonie'];
  selectedCategory: string = 'all';

  constructor(
    private productsService: Products,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productsService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data;
        this.extractCategories();
      },
      error: (err) => console.error('Erreur chargement catalogue:', err)
    });
  }

  extractCategories(): void {
    const cats = this.products.map(p => p.category);
    this.categories = [...new Set(cats)];
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    if (category === 'all') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(p => p.category === category);
    }
  }

  viewDetails(id: number): void {
    this.router.navigate(['/client/product', id]);
  }

}
*/
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ Ajoutez FormsModule pour ngModel
  templateUrl: './catalog.html',
  styleUrl: './catalog.css'
})
export class Catalog {
  categories: string[] = ['Tous', 'Électronique', 'Informatique', 'Téléphonie'];
  selectedCategory = 'Tous';
  
  // ✅ Ajoutez la propriété filteredProducts
  filteredProducts: any[] = [];

  // ✅ Données de test pour les produits
  products = [
    { 
      id: 1, 
      name: 'Laptop Dell XPS', 
      description: 'Ordinateur portable haute performance avec écran 15 pouces', 
      price: 1299.99, 
      category: 'Informatique',
      stock: 8,
      imageUrl: 'assets/laptop.jpg'
    },
    { 
      id: 2, 
      name: 'iPhone 15 Pro', 
      description: 'Smartphone Apple dernière génération avec camera avancée', 
      price: 1199.99, 
      category: 'Téléphonie',
      stock: 15,
      imageUrl: 'assets/iphone.jpg'
    },
    { 
      id: 3, 
      name: 'Casque Sony WH-1000XM4', 
      description: 'Casque audio sans fil avec réduction de bruit active', 
      price: 349.99, 
      category: 'Électronique',
      stock: 3,
      imageUrl: 'assets/headphones.jpg'
    },
    { 
      id: 4, 
      name: 'Samsung Galaxy Tab S9', 
      description: 'Tablette Android performante pour le travail et les loisirs', 
      price: 799.99, 
      category: 'Électronique',
      stock: 12,
      imageUrl: 'assets/tablet.jpg'
    }
  ];

  constructor() {
    // ✅ Initialisez filteredProducts avec tous les produits au démarrage
    this.filteredProducts = [...this.products];
  }

  // ✅ Ajoutez la méthode onCategoryChange
  onCategoryChange(category: string) {
    this.selectedCategory = category;
    
    if (category === 'Tous') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product => 
        product.category === category
      );
    }
  }

  // ✅ Méthode pour formater le prix (optionnel)
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(price);
  }
  // Dans la classe Catalog, ajoutez cette méthode :
addToCart(product: any) {
  console.log('Produit ajouté au panier:', product);
  // Ici vous pouvez implémenter la logique du panier
  alert(`${product.name} ajouté au panier!`);
}
}