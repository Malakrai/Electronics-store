import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import {
  LoginRequest,
  LoginResponse,
  AdminLoginResponse
} from '../../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  requiresQrCode: boolean = false;
  qrCodeUrl: string = '';
  isLoading: boolean = false;
  passwordVisible: boolean = false;
  isAdminUser: boolean = false;
  adminEmail: string = '';
  tempPassword: string = '';
  lastResponse: any = {}; // Pour debug

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      totpCode: ['']
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.authService.isAuthenticated()) {
        const user = this.authService.getCurrentUser();
        if (user) {
          this.redirectByRole(user.userType);
        }
      }
    }
  }

  getButtonText(): string {
    if (this.isLoading) return 'Connexion en cours...';
    if (this.requiresQrCode) {
      const code = this.loginForm.get('totpCode')?.value;
      return code?.length === 6 ? 'Vérifier le code' : 'QR Code affiché';
    }
    return 'Se connecter';
  }

  onSubmit(): void {
    if (this.requiresQrCode) {
      // Mode vérification 2FA pour admin
      this.verifyAdmin2FA();
    } else {
      // Mode connexion normale
      this.handleLogin();
    }
  }

  handleLogin(): void {
    if (this.loginForm.get('email')?.invalid || this.loginForm.get('password')?.invalid) {
      this.markFormGroupTouched();
      this.errorMessage = 'Veuillez remplir tous les champs correctement';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const email = this.loginForm.get('email')?.value.toLowerCase();
    const password = this.loginForm.get('password')?.value;

    console.log('🔐 Tentative de connexion:', { email, password: '***' });

    // Stocker les identifiants temporairement
    this.adminEmail = email;
    this.tempPassword = password;

    const loginRequest: LoginRequest = {
      email: email,
      password: password
    };

    // Appel au backend - UN SEUL APPEL maintenant
    this.authService.login(loginRequest).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.lastResponse = response; // Pour debug
        console.log('✅ Réponse login complète:', response);

        // CORRECTION : Vérifier si le QR code est directement dans la réponse
        if (response.userType === 'ADMIN' && response.requires2fa === true && response.qrCodeUrl) {
          console.log('🔐 Admin avec 2FA - QR code disponible dans la réponse initiale');
          this.isAdminUser = true;
          this.requiresQrCode = true;
          this.qrCodeUrl = response.qrCodeUrl;
          this.successMessage = response.message || 'Scannez le QR code avec Google Authenticator';

          // Désactiver les champs pendant la 2FA
          this.loginForm.get('email')?.disable();
          this.loginForm.get('password')?.disable();

        } else if (response.jwtToken) {
          // Connexion normale réussie (client, magasinier, ou admin sans 2FA)
          console.log('✅ Connexion normale réussie avec token');
          this.handleSuccessfulLogin(response);
        } else if (response.userType === 'ADMIN' && response.requires2fa === true) {
          // Cas où le backend indique que c'est un admin avec 2FA mais pas de QR code
          console.log('⚠️ Admin avec 2FA mais QR code manquant, tentative de récupération');
          this.requestAdminQRCode(email, password);
        } else {
          this.errorMessage = response.message || response.error || 'Réponse inattendue du serveur';
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.handleLoginError(error, false);
      }
    });
  }

  requestAdminQRCode(email: string, password: string): void {
    this.isLoading = true;

    const request = {
      email: email,
      password: password
    };

    console.log('🔄 Demande de QR code pour admin:', email);

    // CORRECTION : L'endpoint est /admin/qrcode, pas /admin/login
    this.http.post<any>('http://localhost:8080/api/auth/admin/qrcode', request).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        console.log('✅ Réponse QR code:', response);

        if (response.qrCodeRequired && response.qrCodeUrl) {
          // Afficher le QR code
          this.requiresQrCode = true;
          this.qrCodeUrl = response.qrCodeUrl;
          this.successMessage = response.message || 'Scannez le QR code avec Google Authenticator';

          // Désactiver les champs pendant la 2FA
          this.loginForm.get('email')?.disable();
          this.loginForm.get('password')?.disable();
        } else if (response.qrCodeUri) {
          // Alternative: si le backend retourne qrCodeUri
          this.requiresQrCode = true;
          this.qrCodeUrl = response.qrCodeUri;
          this.successMessage = 'Scannez le QR code avec Google Authenticator';

          this.loginForm.get('email')?.disable();
          this.loginForm.get('password')?.disable();
        } else {
          this.errorMessage = 'QR code non disponible dans la réponse';
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('❌ Erreur QR code:', error);
        this.errorMessage = error.error?.error || 'Erreur lors de la récupération du QR code';
      }
    });
  }

  verifyAdmin2FA(): void {
    const totpCode = this.loginForm.get('totpCode')?.value;
    if (!totpCode || totpCode.length !== 6) {
      this.errorMessage = 'Veuillez entrer un code à 6 chiffres';
      return;
    }

    this.isLoading = true;

    // Utiliser le mot de passe stocké temporairement
    const request = {
      email: this.adminEmail,
      password: this.tempPassword,
      totpCode: totpCode
    };

    console.log('🔐 Vérification 2FA pour admin:', this.adminEmail);

    // Utiliser le service AuthService au lieu de http directement
    this.authService.verifyAdmin2FA(this.adminEmail, this.tempPassword, totpCode).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        console.log('✅ Réponse vérification 2FA:', response);

        if (response.jwtToken) {
          this.handleAdminSuccessfulLogin(response);
          // Nettoyer le mot de passe temporaire
          this.tempPassword = '';
        } else {
          this.errorMessage = response.error || 'Code 2FA invalide ou expiré';
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('❌ Erreur vérification 2FA:', error);

        if (error.status === 401 || error.status === 400) {
          this.errorMessage = error.error?.error || 'Code 2FA invalide';
        } else if (error.status === 403) {
          this.errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
        } else if (error.status === 0) {
          this.errorMessage = 'Serveur inaccessible. Vérifiez votre connexion.';
        } else {
          this.errorMessage = `Erreur ${error.status}: ${error.error?.error || 'Erreur lors de la vérification'}`;
        }
      }
    });
  }

  onTotpCodeChange(): void {
    const code = this.loginForm.get('totpCode')?.value;
    if (code && code.length === 6 && this.requiresQrCode) {
      // Auto-submit quand le code est complet
      setTimeout(() => {
        this.verifyAdmin2FA();
      }, 300);
    }
  }

  onForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  // Retour au formulaire de connexion
  goBackToLogin(): void {
    this.requiresQrCode = false;
    this.qrCodeUrl = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.isAdminUser = false;
    this.loginForm.get('totpCode')?.reset();
    this.loginForm.get('email')?.enable();
    this.loginForm.get('password')?.enable();
    this.tempPassword = '';
  }

  private handleSuccessfulLogin(response: any): void {
    this.successMessage = '✅ Connexion réussie! Redirection...';

    // CORRECTION : Le backend retourne jwtToken, pas token
    const token = response.jwtToken || response.token;

    if (isPlatformBrowser(this.platformId) && token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        email: response.email,
        userId: response.userId,
        userType: response.userType,
        firstName: response.firstName,
        lastName: response.lastName,
        requires2fa: response.requires2fa || false
      }));
    }

    setTimeout(() => {
      this.redirectByRole(response.userType);
    }, 1500);
  }

  private handleAdminSuccessfulLogin(response: any): void {
    this.successMessage = '✅ Connexion admin réussie! Redirection...';

    if (isPlatformBrowser(this.platformId) && response.jwtToken) {
      localStorage.setItem('token', response.jwtToken);
      localStorage.setItem('user', JSON.stringify({
        email: response.email || this.adminEmail,
        userType: response.userType || 'ADMIN',
        roles: response.roles || ['ROLE_ADMIN']
      }));
    }

    setTimeout(() => {
      this.router.navigate(['/admin/dashboard']);
    }, 1500);
  }

  private handleLoginError(error: HttpErrorResponse, isAdmin: boolean): void {
    this.isLoading = false;
    console.error('❌ Erreur connexion:', error);

    if (error.status === 400) {
      this.errorMessage = error.error?.error || 'Identifiants incorrects';
    } else if (error.status === 401) {
      this.errorMessage = 'Email ou mot de passe incorrect';
    } else if (error.status === 403) {
      this.errorMessage = isAdmin ? 'Accès admin refusé' : 'Accès refusé';
    } else if (error.status === 404) {
      this.errorMessage = 'Utilisateur non trouvé';
    } else if (error.status === 0) {
      this.errorMessage = 'Serveur inaccessible. Vérifiez que le backend est démarré.';
    } else if (error.status === 500) {
      this.errorMessage = 'Erreur serveur. Contactez l\'administrateur.';
    } else {
      this.errorMessage = `Erreur ${error.status}: ${error.error?.error || error.statusText}`;
    }
  }

  private redirectByRole(userType: string): void {
    console.log('🎯 Redirection pour:', userType);
    switch (userType?.toUpperCase()) {
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'MAGASINIER':
        this.router.navigate(['/magasinier/dashboard']);
        break;
      case 'CUSTOMER':
        this.router.navigate(['/customer/catalog']);
        break;
      default:
        this.router.navigate(['/dashboard']);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  protected readonly console = console;
}

