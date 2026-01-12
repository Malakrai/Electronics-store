import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/products';

@Component({
  selector: 'app-products-crud',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './products-crud.html',
  styleUrls: ['./products-crud.css']
})
export class ProductsCrud implements OnInit {
  products: any[] = [];
  categories: string[] = ['Laptops', 'Phones', 'Tablets', 'Accessories', 'Electronique'];

  // Utiliser newProduct comme dans le template
  newProduct: any = {
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    imageUrl: '',
    status: 'active',
    sku: '' // Ajouté pour correspondre au backend
  };

  selectedProduct: any = null;
  isEditing: boolean = false;
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.errorMessage = '';

    this.productService.getProducts().subscribe({
      next: (data: any) => {
        this.products = data || [];
        console.log(`${this.products.length} produits chargés`);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur chargement:', error);
        this.errorMessage = 'Impossible de charger les produits';
        this.loading = false;
        this.autoClearMessages();
      }
    });
  }

  createProduct() {
    // Validation
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.clearMessages();

    console.log('Création produit avec données:', this.newProduct);

    this.productService.createProduct(this.newProduct).subscribe({
      next: (response: any) => {
        console.log('Produit créé:', response);

        // Ajouter le produit à la liste avec l'ID du serveur
        if (response.id) {
          this.products.push(response);
        } else {
          // Fallback si la réponse n'a pas d'ID
          const newProd = { ...this.newProduct, id: Date.now() };
          this.products.push(newProd);
        }

        this.resetForm();
        this.successMessage = 'Produit créé avec succès';
        this.loading = false;
        this.autoClearMessages();
      },
      error: (error: any) => {
        console.error('Erreur création:', {
          status: error.status,
          error: error.error,
          message: error.message
        });

        // Extraire le message d'erreur
        if (error.error) {
          if (typeof error.error === 'string') {
            this.errorMessage = error.error;
          } else if (error.error.error) {
            this.errorMessage = error.error.error;
          } else if (error.error.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Erreur lors de la création du produit';
          }
        } else {
          this.errorMessage = error.message || 'Erreur lors de la création du produit';
        }

        this.loading = false;
        this.autoClearMessages();
      }
    });
  }

  editProduct(product: any) {
    this.isEditing = true;
    this.selectedProduct = { ...product };
  }

  updateProduct() {
    if (!this.selectedProduct) {
      this.errorMessage = 'Aucun produit sélectionné';
      return;
    }

    // Validation pour l'édition
    if (!this.selectedProduct.name || !this.selectedProduct.price || this.selectedProduct.price <= 0) {
      this.errorMessage = 'Le nom et le prix sont obligatoires';
      return;
    }

    this.loading = true;
    this.clearMessages();

    console.log('Mise à jour produit ID:', this.selectedProduct.id, 'données:', this.selectedProduct);

    this.productService.updateProduct(this.selectedProduct.id, this.selectedProduct).subscribe({
      next: (response: any) => {
        console.log('Produit modifié:', response);

        // Mettre à jour la liste
        const index = this.products.findIndex(p => p.id === this.selectedProduct.id);
        if (index !== -1) {
          this.products[index] = { ...this.selectedProduct };
        }

        this.cancelEdit();
        this.successMessage = 'Produit modifié avec succès';
        this.loading = false;
        this.autoClearMessages();
      },
      error: (error: any) => {
        console.error('Erreur modification:', error);

        if (error.error) {
          if (typeof error.error === 'string') {
            this.errorMessage = error.error;
          } else if (error.error.error) {
            this.errorMessage = error.error.error;
          } else if (error.error.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Erreur lors de la modification';
          }
        } else {
          this.errorMessage = error.message || 'Erreur lors de la modification';
        }

        this.loading = false;
        this.autoClearMessages();
      }
    });
  }

  deleteProduct(product: any) {
    if (!product || !product.id) {
      this.errorMessage = 'Produit invalide';
      return;
    }

    if (!confirm(`Supprimer "${product.name}" ?`)) {
      return;
    }

    this.loading = true;
    this.clearMessages();

    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        console.log('Produit supprimé');
        this.products = this.products.filter(p => p.id !== product.id);
        this.successMessage = 'Produit supprimé avec succès';
        this.loading = false;
        this.autoClearMessages();
      },
      error: (error: any) => {
        console.error('Erreur suppression:', error);

        if (error.error) {
          if (typeof error.error === 'string') {
            this.errorMessage = error.error;
          } else if (error.error.error) {
            this.errorMessage = error.error.error;
          } else if (error.error.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Erreur lors de la suppression';
          }
        } else {
          this.errorMessage = error.message || 'Erreur lors de la suppression';
        }

        this.loading = false;
        this.autoClearMessages();
      }
    });
  }

  cancelEdit() {
    this.isEditing = false;
    this.selectedProduct = null;
    this.resetForm();
    this.clearMessages();
  }

  private validateForm(): boolean {
    const errors: string[] = [];

    if (!this.newProduct.name?.trim()) {
      errors.push('Le nom du produit est obligatoire');
    }

    if (!this.newProduct.price || this.newProduct.price <= 0) {
      errors.push('Le prix doit être supérieur à 0');
    }

    if (this.newProduct.stock !== undefined && this.newProduct.stock < 0) {
      errors.push('Le stock ne peut pas être négatif');
    }

    if (!this.newProduct.category?.trim()) {
      errors.push('La catégorie est obligatoire');
    }

    if (errors.length > 0) {
      this.errorMessage = errors.join('. ');
      return false;
    }

    return true;
  }

  private resetForm() {
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
      imageUrl: '',
      status: 'active',
      sku: ''
    };
  }

  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private autoClearMessages() {
    setTimeout(() => {
      this.clearMessages();
    }, 5000);
  }
}
