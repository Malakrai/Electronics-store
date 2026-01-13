import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/products';
import { Router } from '@angular/router';

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

  userRole: string = ''; // Pour adapter l'interface si besoin

  newProduct: any = {
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    imageUrl: '',
    status: 'active',
    sku: ''
  };

  selectedProduct: any = null;
  isEditing: boolean = false;
  loading: boolean = false;
  loadingId: number | null = null;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkAuth();
  }

  private checkAuth(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      alert('Veuillez vous connecter pour accéder à cette page');
      this.router.navigate(['/login']);
      return;
    }

    try {
      const userObj = JSON.parse(user);
      this.userRole = userObj.userType || '';

      // Autoriser ADMIN et MAGASINIER
      const allowedRoles = ['ADMIN', 'MAGASINIER'];

      if (!allowedRoles.includes(this.userRole)) {
        alert(`Accès non autorisé. Votre rôle: ${this.userRole}`);
        this.router.navigate(['/dashboard']);
        return;
      }

      console.log('Rôle utilisateur:', this.userRole, ' - Accès complet aux produits');
      this.loadProducts();
    } catch (e) {
      console.error('Erreur vérification auth:', e);
      this.router.navigate(['/login']);
    }
  }

  loadProducts() {
    this.loading = true;
    this.clearMessages();

    this.productService.getProducts().subscribe({
      next: (data: any) => {
        this.products = data || [];
        console.log(`${this.products.length} produits chargés`);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur chargement produits:', error);
        this.errorMessage = 'Impossible de charger les produits';
        this.loading = false;
        this.autoClearMessages();
      }
    });
  }

  createProduct() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.clearMessages();

    console.log('Création produit par', this.userRole, ':', this.newProduct);

    this.productService.createProduct(this.newProduct).subscribe({
      next: (response: any) => {
        console.log('Produit créé avec succès:', response);

        if (response && response.id) {
          this.products.push(response);
          this.successMessage = 'Produit créé avec succès';
        } else {
          this.errorMessage = 'Réponse invalide du serveur';
        }

        this.resetForm();
        this.loading = false;
        this.autoClearMessages();

        // Recharger la liste
        setTimeout(() => {
          this.loadProducts();
        }, 500);
      },
      error: (error: any) => {
        console.error('Erreur création:', error);

        let errorMsg = 'Erreur lors de la création';
        if (error.status === 400) {
          if (error.error?.message) {
            errorMsg = error.error.message;
          } else if (error.error) {
            errorMsg = 'Données invalides : ' + JSON.stringify(error.error);
          }
        } else if (error.error?.error) {
          errorMsg = error.error.error;
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        } else if (error.message) {
          errorMsg = error.message;
        }

        this.errorMessage = errorMsg;
        this.loading = false;
        this.autoClearMessages();
      }
    });
  }

  editProduct(product: any) {
    this.isEditing = true;
    this.selectedProduct = { ...product };
    console.log('Édition produit par', this.userRole, ':', this.selectedProduct);
  }

  updateProduct() {
    if (!this.selectedProduct || !this.selectedProduct.id) {
      this.errorMessage = 'Aucun produit sélectionné';
      return;
    }

    // Validation
    if (!this.selectedProduct.name || !this.selectedProduct.price || this.selectedProduct.price <= 0) {
      this.errorMessage = 'Le nom et le prix sont obligatoires (prix > 0)';
      return;
    }

    this.loading = true;
    this.clearMessages();

    // Préparer les données avec TOUS les champs requis par Spring
    const updateData = {
      name: this.selectedProduct.name,
      description: this.selectedProduct.description || '',
      price: Number(this.selectedProduct.price),
      category: this.selectedProduct.category || '',
      stock: Number(this.selectedProduct.stock) || 0,
      imageUrl: this.selectedProduct.imageUrl || '',
      sku: this.selectedProduct.sku || '',
      status: this.selectedProduct.status || 'active',
      // Champs supplémentaires requis
      cost: 0, // Valeur par défaut
      manufacturerId: 0, // Valeur par défaut
      weight: 0, // Valeur par défaut
      dimensions: '', // Valeur par défaut
      isActive: true // Valeur par défaut
    };

    console.log('📤 Mise à jour produit avec données complètes:', updateData);

    this.productService.updateProduct(this.selectedProduct.id, updateData).subscribe({
      next: (response: any) => {
        console.log('✅ Produit modifié:', response);

        // Mettre à jour localement
        const index = this.products.findIndex(p => p.id === this.selectedProduct.id);
        if (index !== -1) {
          this.products[index] = { ...this.selectedProduct };
        }

        this.cancelEdit();
        this.successMessage = 'Produit modifié avec succès';
        this.loading = false;
        this.autoClearMessages();

        setTimeout(() => {
          this.loadProducts();
        }, 500);
      },
      error: (error: any) => {
        console.error('❌ Erreur modification:', error);

        this.errorMessage = error.error?.message || error.message || 'Erreur lors de la modification';
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

    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ? Cette action est irréversible.`)) {
      return;
    }

    this.loadingId = product.id;
    this.clearMessages();

    this.productService.deleteProduct(product.id).subscribe({
      next: (response: any) => {
        console.log('Produit supprimé avec succès par', this.userRole);

        // Retirer le produit de la liste localement
        this.products = this.products.filter(p => p.id !== product.id);
        this.successMessage = 'Produit supprimé avec succès';
        this.loadingId = null;
        this.autoClearMessages();
      },
      error: (error: any) => {
        console.error('Erreur suppression:', error);

        let errorMsg = 'Erreur lors de la suppression';
        if (error.status === 404) {
          errorMsg = 'Produit non trouvé sur le serveur';
        } else if (error.error?.error) {
          errorMsg = error.error.error;
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        } else if (error.message) {
          errorMsg = error.message;
        }

        this.errorMessage = errorMsg;
        this.loadingId = null;
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
