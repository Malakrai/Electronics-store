import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {

  private apiUrl = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) { }

  // GET : récupérer tous les produits
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  // GET : récupérer un produit par ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // POST : créer un produit
 createProduct(product: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/add`, product);
}


 updateProduct(id: number, product: any): Observable<any> {
   return this.http.put<any>(
     `${this.apiUrl}/${id}`,   // ✅ SANS /update
     product
   );
 }


  // DELETE : supprimer un produit
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // SEARCH (uniquement si ton backend le gère)
  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/search?q=${query}`);
  }
}

