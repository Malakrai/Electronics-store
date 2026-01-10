import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest } from '../../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  errorMessage = '';
  successMessage = '';

  requiresQrCode = false;
  qrCodeUrl = '';

  isLoading = false;
  passwordVisible = false;

  // Stockage temporaire pendant étape 2FA
  private adminEmail = '';
  private tempPassword = '';

  // ✅ Empêche double submit / double request 2FA
  private verifying2fa = false;

  // Pour debug
  lastResponse: any = {};

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
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
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.authService.isAuthenticated()) {
      const user = this.authService.getCurrentUser();
      if (user) this.redirectByRole((user as any).userType);
    }
  }

  getButtonText(): string {
    if (this.isLoading) return 'Connexion en cours...';

    if (this.requiresQrCode) {
      const code = (this.loginForm.get('totpCode')?.value || '').trim();
      return code.length === 6 ? 'Vérifier le code' : 'QR Code affiché';
    }

    return 'Se connecter';
  }

  onSubmit(): void {
    this.clearMessages();

    if (this.requiresQrCode) {
      this.verifyAdmin2FA();
    } else {
      this.handleLogin();
    }
  }

  private handleLogin(): void {
    if (this.loginForm.get('email')?.invalid || this.loginForm.get('password')?.invalid) {
      this.markFormGroupTouched();
      this.errorMessage = 'Veuillez remplir tous les champs correctement';
      return;
    }

    this.isLoading = true;

    const email = (this.loginForm.get('email')?.value || '').toLowerCase().trim();
    const password = this.loginForm.get('password')?.value;

    // stock temporaire pour 2FA
    this.adminEmail = email;
    this.tempPassword = password;

    const loginRequest: LoginRequest = { email, password };

    this.authService.login(loginRequest).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.lastResponse = response;
        console.log('✅ Réponse login complète:', response);

        // ✅ Cas admin avec 2FA et QR dans la réponse
        if (response.userType === 'ADMIN' && response.requires2fa === true && response.qrCodeUrl) {
          this.requiresQrCode = true;
          this.qrCodeUrl = response.qrCodeUrl;
          this.successMessage = response.message || 'Scannez le QR code avec Google Authenticator';

          // désactiver champs pendant 2FA
          this.loginForm.get('email')?.disable();
          this.loginForm.get('password')?.disable();
          return;
        }

        // ✅ Connexion normale (jwt stocké par AuthService.handleLoginSuccess déjà)
        if (response.jwtToken || response.token) {
          this.successMessage = '✅ Connexion réussie! Redirection...';
          setTimeout(() => this.redirectByRole(response.userType), 500);
          return;
        }

        // ✅ Admin avec 2FA mais pas de QR → demander via endpoint dédié
        if (response.userType === 'ADMIN' && response.requires2fa === true) {
          this.requestAdminQRCode();
          return;
        }

        this.errorMessage = response.message || response.error || 'Réponse inattendue du serveur';
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.handleLoginError(error);
      }
    });
  }

  private requestAdminQRCode(): void {
    this.isLoading = true;

    const email = this.adminEmail;
    const password = this.tempPassword;

    this.authService.getAdminQRCode(email, password).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        console.log('✅ Réponse QR code:', response);

        const url = response.qrCodeUrl || response.qrCodeUri;
        if (url) {
          this.requiresQrCode = true;
          this.qrCodeUrl = url;
          this.successMessage = response.message || 'Scannez le QR code avec Google Authenticator';

          this.loginForm.get('email')?.disable();
          this.loginForm.get('password')?.disable();
          return;
        }

        this.errorMessage = 'QR code non disponible dans la réponse';
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('❌ Erreur QR code:', error);
        this.errorMessage = error.error?.error || 'Erreur lors de la récupération du QR code';
      }
    });
  }

  verifyAdmin2FA(): void {
    if (this.verifying2fa) return;

    const totpCode = (this.loginForm.get('totpCode')?.value || '').trim();
    if (totpCode.length !== 6) {
      this.errorMessage = 'Veuillez entrer un code à 6 chiffres';
      return;
    }

    this.isLoading = true;
    this.verifying2fa = true;

    this.authService.verifyAdmin2FA(this.adminEmail, this.tempPassword, totpCode).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.verifying2fa = false;

        console.log('✅ Réponse vérification 2FA:', response);

        if (response.jwtToken) {
          this.successMessage = '✅ Authentification 2FA réussie ! Redirection...';

          // Nettoyage password temporaire
          this.tempPassword = '';

          setTimeout(() => this.redirectByRole('ADMIN'), 500);
          return;
        }

        this.errorMessage = response.error || 'Code 2FA invalide ou expiré';
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.verifying2fa = false;

        console.error('❌ Erreur vérification 2FA:', error);
        this.errorMessage = error.error?.error || 'Erreur lors de la vérification 2FA';
      }
    });
  }

  onTotpCodeChange(): void {
    const code = (this.loginForm.get('totpCode')?.value || '').trim();

    // auto submit safe
    if (this.requiresQrCode && code.length === 6 && !this.verifying2fa && !this.isLoading) {
      setTimeout(() => this.verifyAdmin2FA(), 150);
    }
  }

  goBackToLogin(): void {
    this.requiresQrCode = false;
    this.qrCodeUrl = '';
    this.clearMessages();

    this.loginForm.get('totpCode')?.reset();
    this.loginForm.get('email')?.enable();
    this.loginForm.get('password')?.enable();

    this.adminEmail = '';
    this.tempPassword = '';
    this.verifying2fa = false;
  }

  private redirectByRole(userType: string): void {
    console.log('🎯 Redirection pour:', userType);

    switch ((userType || '').toUpperCase()) {
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'MAGASINIER':
        this.router.navigate(['/magasinier/dashboard']);
        break;
      case 'CUSTOMER':
        // ✅ chez toi c'est /catalog
        this.router.navigate(['/catalog']);
        break;
      default:
        this.router.navigate(['/catalog']);
    }
  }

  private handleLoginError(error: HttpErrorResponse): void {
    console.error('❌ Erreur connexion:', error);

    if (error.status === 400) this.errorMessage = error.error?.error || 'Identifiants incorrects';
    else if (error.status === 401) this.errorMessage = 'Email ou mot de passe incorrect';
    else if (error.status === 403) this.errorMessage = 'Accès refusé';
    else if (error.status === 404) this.errorMessage = 'Utilisateur non trouvé';
    else if (error.status === 0) this.errorMessage = 'Serveur inaccessible. Vérifiez que le backend est démarré.';
    else if (error.status === 500) this.errorMessage = 'Erreur serveur.';
    else this.errorMessage = `Erreur ${error.status}: ${error.error?.error || error.statusText}`;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
