import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    console.log('Headers envoyés:', headers);
    return headers;
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ Erreur API ProductService:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      error: error.error
    });

    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.error || error.error?.message || error.statusText || 'Erreur serveur';
    }

    return throwError(() => new Error(errorMessage));
  }

  // GET : récupérer tous les produits
  getProducts(): Observable<any[]> {
    console.log('📥 GET produits:', `${this.apiUrl}`);
    return this.http.get<any[]>(this.apiUrl, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // GET : récupérer un produit par ID
  getProductById(id: number): Observable<any> {
    console.log('📥 GET produit ID:', `${this.apiUrl}/${id}`);
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // POST : créer un produit
  createProduct(product: any): Observable<any> {
    console.log('📤 POST création produit:', `${this.apiUrl}/add`, product);
    return this.http.post<any>(`${this.apiUrl}/add`, product, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  updateProduct(id: number, product: any) {
    return this.http.put(
      `http://localhost:8080/api/products/${id}`,
      product
    );
  }


  deleteProduct(id: number): Observable<any> {
    console.log('🗑️ DELETE produit ID:', `${this.apiUrl}/${id}`);
    return this.http.delete<any>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  searchProducts(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?q=${query}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }
}
