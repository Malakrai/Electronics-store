import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erreur API:', {
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      error: error.error
    });

    let errorMessage = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = error.error.message;
    } else {
      // Erreur côté serveur
      if (error.error) {
        if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error.error) {
          errorMessage = error.error.error;
        } else if (error.error.message) {
          errorMessage = error.error.message;
        }
      }
    }

    return throwError(() => new Error(errorMessage));
  }

  // Récupérer tous les produits
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Récupérer un produit par ID
  getProductById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Créer un nouveau produit
  createProduct(product: any): Observable<any> {
    // Formater les données avant envoi
    const formattedProduct = {
      name: product.name?.trim(),
      price: product.price ? Number(product.price) : 0,
      sku: product.sku?.trim() || undefined,
      description: product.description?.trim(),
      category: product.category?.trim(),
      stock: product.stock ? Number(product.stock) : 0,
      imageUrl: product.imageUrl?.trim(),
      manufacturerId: product.manufacturerId ? Number(product.manufacturerId) : null,
      status: product.status?.trim() || 'active',
      isActive: product.isActive !== undefined ? Boolean(product.isActive) : true,
      weight: product.weight ? Number(product.weight) : null,
      dimensions: product.dimensions?.trim(),
      cost: product.cost ? Number(product.cost) : null
    };

    console.log('Envoi au serveur:', formattedProduct);

    return this.http.post<any>(`${this.apiUrl}/add`, formattedProduct, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Mettre à jour un produit
  updateProduct(id: number, product: any): Observable<any> {
    const formattedProduct = {
      ...product,
      id: id // S'assurer que l'ID est inclus
    };

    return this.http.put<any>(`${this.apiUrl}/${id}`, formattedProduct, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Supprimer un produit
  deleteProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Rechercher des produits
  searchProducts(keyword: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?keyword=${keyword}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Récupérer par catégorie
  getProductsByCategory(category: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/category/${category}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }
}
