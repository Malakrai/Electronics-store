/*import { Component, OnInit } from '@angular/core';
import { Products } from '../../../services/products';
import { Product } from '../../../models/product';
import { CommonModule } from '@angular/common'; // ✅ Ajouté
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products-crud',
  imports: [CommonModule, FormsModule],
  templateUrl: './products-crud.html',
  styleUrl: './products-crud.css',
})
export class ProductsCrud implements OnInit{
  products: Product[] = [
    { 
      id: 1, 
      name: 'Produit Test', 
      description: 'Description test', 
      price: 100, 
      category: 'Électronique', 
      stock: 10}
  ];
  selectedProduct: Product | null = null;
  isEditing: boolean = false;

  newProduct: Product = {
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    imageUrl: ''
  };

  constructor(private productsService: Products) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productsService.getProducts().subscribe({
      next: (data) => this.products = data,
      error: (err) => console.error('Erreur chargement produits:', err)
    });
  }

  createProduct(): void {
    this.productsService.createProduct(this.newProduct).subscribe({
      next: (product) => {
        this.products.push(product);
        this.resetForm();
        alert('Produit créé avec succès !');
      },
      error: (err) => console.error('Erreur création:', err)
    });
  }

  editProduct(product: Product): void {
    this.selectedProduct = { ...product };
    this.isEditing = true;
  }

  updateProduct(): void {
    if (this.selectedProduct && this.selectedProduct.id) {
      this.productsService.updateProduct(this.selectedProduct.id, this.selectedProduct).subscribe({
        next: () => {
          this.loadProducts();
          this.cancelEdit();
          alert('Produit modifié avec succès !');
        },
        error: (err) => console.error('Erreur modification:', err)
      });
    }
  }

  deleteProduct(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      this.productsService.deleteProduct(id).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== id);
          alert('Produit supprimé !');
        },
        error: (err) => console.error('Erreur suppression:', err)
      });
    }
  }

  cancelEdit(): void {
    this.selectedProduct = null;
    this.isEditing = false;
  }

  resetForm(): void {
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
      imageUrl: ''
    };
  }

}
*/
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],  // ✅ Import des modules
  templateUrl: './products-crud.html',
  styleUrl: './products-crud.css'
})
export class ProductsCrud {
  isEditing = false;
  selectedProduct: any = null;
  products: any[] = [];
  
  newProduct = { 
    name: '', 
    description: '', 
    price: 0, 
    category: '', 
    stock: 0, 
    imageUrl: '' 
  };

  constructor() {
    // Données de test
    this.products = [
      { 
        id: 1, 
        name: 'Laptop Dell', 
        description: 'Ordinateur portable haute performance', 
        price: 999.99, 
        category: 'Informatique', 
        stock: 15, 
        imageUrl: 'assets/laptop.jpg' 
      },
      { 
        id: 2, 
        name: 'Smartphone Samsung', 
        description: 'Smartphone Android dernière génération', 
        price: 699.99, 
        category: 'Téléphonie', 
        stock: 25, 
        imageUrl: 'assets/phone.jpg' 
      }
    ];
  }

  // ✅ Créer un nouveau produit
  createProduct() {
    const product = { 
      ...this.newProduct, 
      id: Date.now() 
    };
    this.products.push(product);
    this.resetNewProduct();
    console.log('Produit créé:', product);
  }

  // ✅ Éditer un produit
  editProduct(product: any) {
    this.selectedProduct = { ...product };
    this.isEditing = true;
  }

  // ✅ Mettre à jour un produit
  updateProduct() {
    if (this.selectedProduct) {
      const index = this.products.findIndex(p => p.id === this.selectedProduct.id);
      if (index !== -1) {
        this.products[index] = { ...this.selectedProduct };
      }
      this.cancelEdit();
    }
  }

  // ✅ Annuler l'édition
  cancelEdit() {
    this.isEditing = false;
    this.selectedProduct = null;
  }

  // ✅ Supprimer un produit
  deleteProduct(product: any) {
    this.products = this.products.filter(p => p.id !== product.id);
    console.log('Produit supprimé:', product);
  }

  // ✅ Réinitialiser le formulaire
  private resetNewProduct() {
    this.newProduct = { 
      name: '', 
      description: '', 
      price: 0, 
      category: '', 
      stock: 0, 
      imageUrl: '' 
    };
  }

  // ✅ Catégories disponibles
  get categories(): string[] {
    return ['Informatique', 'Téléphonie', 'Électronique', 'Accessoires'];
  }
}