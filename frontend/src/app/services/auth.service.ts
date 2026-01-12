import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { LoginRequest, LoginResponse, AdminLoginResponse, User } from '../models/user.model';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth'; // CORRIGÉ : /api/auth

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  // Méthode principale pour /api/auth/login
  login(data: LoginRequest): Observable<any> {
    console.log(' AuthService: Appel à /login avec:', data.email);
    return this.http.post<any>(`${this.apiUrl}/login`, data).pipe(
      tap(res => {
        console.log(' AuthService: Réponse login reçue:', res);

        // Stocker le token si la connexion est réussie (sans 2FA)
        if (!res.requires2fa && (res.jwtToken || res.token)) {
          this.handleLoginSuccess(res);
        }
      }),
      catchError(error => {
        console.error(' AuthService: Erreur login:', error);
        return throwError(() => error);
      })
    );
  }

  // Vérification 2FA pour admin
  verifyAdmin2FA(email: string, password: string, totpCode: string): Observable<any> {
  const request = {
    email: email.trim(),
    password,
    totpCode: (totpCode || '').trim()
  };

  console.log('AuthService: Vérification 2FA payload:', request);

  return this.http.post<any>(`${this.apiUrl}/admin/verify-2fa`, request).pipe(
    tap(res => {
      console.log('AuthService: Réponse vérification 2FA:', res);
      if (res.jwtToken) this.handleLoginSuccess(res);
    }),
    catchError(error => {
      console.error('AuthService: Erreur vérification 2FA:', error);
      return throwError(() => error);
    })
  );
}


  // Récupérer le QR code admin (si nécessaire)
  getAdminQRCode(email: string, password: string): Observable<any> {
    console.log(' AuthService: Demande QR code pour:', email);
    const request = { email, password };
    return this.http.post<any>(`${this.apiUrl}/admin/qrcode`, request).pipe(
      tap(res => console.log(' AuthService: QR code reçu')),
      catchError(error => {
        console.error(' AuthService: Erreur QR code:', error);
        return throwError(() => error);
      })
    );
  }


  handleLoginSuccess(res: any) {
    if (isPlatformBrowser(this.platformId)) {
      const token = res.jwtToken || res.token;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({
          email: res.email,
          userType: res.userType,
          firstName: res.firstName,
          lastName: res.lastName,
          userId: res.userId,
          roles: res.roles || []
        }));
        console.log(' AuthService: Session stockée avec succès');
      }
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  getCurrentUser(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('user');
      try {
        return userStr ? JSON.parse(userStr) : null;
      } catch (e) {
        console.error('Erreur parsing user:', e);
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const hasToken = !!token;
    return hasToken;
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log(' AuthService: Déconnexion effectuée');
    }
  }

  // Méthode pour vérifier le statut du token (optionnel)
  validateToken(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token available'));
    }
    return this.http.post<any>(`${this.apiUrl}/validate-token`, { token });
  }
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    if (!user) return null;

    // Cas 1 : roles = ["CUSTOMER"]
    if (user.roles && user.roles.length > 0) {
      return user.roles[0];
    }

    // Cas 2 : userType = "CUSTOMER"
    if ((user as any).userType) {
      return (user as any).userType;
    }

    return null;
  }

  isCustomer(): boolean {
    return this.getUserRole() === 'CUSTOMER';
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  isMagasinier(): boolean {
    return this.getUserRole() === 'MAGASINIER';
  }

}
