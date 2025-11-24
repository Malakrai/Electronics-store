import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root',
})
export class Products {
  private apiUrl = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) { }

  // GET tous les produits
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  // GET un produit par ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // POST créer un produit
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  // PUT modifier un produit
  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  // DELETE supprimer un produit
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // SEARCH produits par nom ou catégorie
  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/search?q=${query}`);
  }
}
