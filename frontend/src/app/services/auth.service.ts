import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  // Méthode de connexion
  login(data: any): Observable<any> {
    console.log('AuthService: Login avec:', data.email);
    return this.http.post<any>(`${this.apiUrl}/login`, data).pipe(
      tap(res => {
        console.log('AuthService: Réponse login:', res);
        if (!res.requires2fa && (res.jwtToken || res.token)) {
          this.handleLoginSuccess(res);
        }
      }),
      catchError(error => {
        console.error('AuthService: Erreur login:', error);
        return throwError(() => error);
      })
    );
  }

  // Vérification 2FA
  verifyAdmin2FA(email: string, password: string, totpCode: string): Observable<any> {
    const request = {
      email: email.trim(),
      password,
      totpCode: (totpCode || '').trim()
    };

    return this.http.post<any>(`${this.apiUrl}/admin/verify-2fa`, request).pipe(
      tap(res => {
        console.log('AuthService: Réponse 2FA:', res);
        if (res.jwtToken) this.handleLoginSuccess(res);
      }),
      catchError(error => {
        console.error('AuthService: Erreur 2FA:', error);
        return throwError(() => error);
      })
    );
  }

  // Gestion succès login
  handleLoginSuccess(res: any) {
    if (isPlatformBrowser(this.platformId)) {
      const token = res.jwtToken || res.token;
      if (token) {
        localStorage.setItem('token', token);

        const userData = {
          email: res.email,
          userType: res.userType,
          firstName: res.firstName,
          lastName: res.lastName,
          userId: res.userId,
          roles: res.roles || [],
          role: res.role || res.userType,
          authorities: res.authorities || []
        };

        localStorage.setItem('user', JSON.stringify(userData));
        console.log('AuthService: Session stockée:', userData);
      }
    }
  }

  // Récupérer token
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  // Récupérer utilisateur courant
  getCurrentUser(): any {
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

  // Vérifier authentification
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  // Déconnexion
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('AuthService: Déconnexion effectuée');
    }
  }

  // Normaliser rôle
  private normalizeRole(role: string | undefined | null): string {
    if (!role) return '';

    role = role.toUpperCase();

    if (role.startsWith('ROLE_')) {
      return role.substring(5);
    }

    return role;
  }

  // Récupérer rôle utilisateur
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    if (!user) return null;

    const possibleSources = [
      user.roles?.[0],
      user.userType,
      (user as any).role,
      (user as any).authorities?.[0],
      (user as any).authority
    ];

    for (const source of possibleSources) {
      if (source) {
        return this.normalizeRole(source);
      }
    }

    return null;
  }

  // Vérifier rôle
  hasRole(expectedRole: string): boolean {
    const userRole = this.getUserRole();
    const normalizedExpected = this.normalizeRole(expectedRole);
    return userRole === normalizedExpected;
  }

  // Méthodes spécifiques de rôle
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isCustomer(): boolean {
    return this.hasRole('CUSTOMER');
  }

  isMagasinier(): boolean {
    return this.hasRole('MAGASINIER');
  }
}
