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
  categories: string[] = ['Laptops', 'Phones', 'Tablets', 'Accessories','Electronique'];
  newProduct: any = {
     sku: '',
  name: '',
  description: '',
  price: 0,
  category: '',
  stock: 0,
  imageUrl: '',
  status: 'active'
  };
  selectedProduct: any = null;
  isEditing: boolean = false;

  constructor(private productService: ProductService) {} 

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (data: any) => { 
        this.products = data;
        console.log('Produits chargés:', data);
      },
      error: (error: any) => console.error('Erreur chargement:', error) 
    });
  }

  createProduct() {
    this.productService.createProduct(this.newProduct).subscribe({
      next: (newProduct: any) => {
        console.log('Produit créé dans BDD:', newProduct);
        this.loadProducts(); 
        this.resetForm();
      },
      error: (error: any) => console.error('Erreur création BDD:', error)
    });
  }

  addProduct(product: any) {
    this.productService.createProduct(product).subscribe({
      next: (newProduct: any) => { 
        console.log('Produit créé:', newProduct);
        this.loadProducts();
      },
      error: (error: any) => console.error('Erreur création:', error) 
    });
  }

  editProduct(product: any) {
    this.selectedProduct = { ...product };
    this.isEditing = true;
  }
    updateProduct() {
    if (this.selectedProduct) {
      this.productService.updateProduct(this.selectedProduct.id, this.selectedProduct).subscribe({
        next: (updatedProduct: any) => {
          console.log('Produit modifié dans BDD:', updatedProduct);
          this.loadProducts(); 
          this.cancelEdit();
        },
        error: (error: any) => console.error('Erreur modification BDD:', error)
      });
    }
  }

  deleteProduct(product: any) {
    if (confirm('Supprimer ce produit de la BDD ?')) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          console.log('Produit supprimé de la BDD');
          this.loadProducts(); 
        },
        error: (error: any) => console.error('Erreur suppression BDD:', error)
      });
    }
  }

  cancelEdit() {
    this.isEditing = false;
    this.selectedProduct = null;
  }




  resetForm() {
    this.newProduct = {
      sku: '',
      name: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
      imageUrl: '',
      status: 'active'
    };
  }
}