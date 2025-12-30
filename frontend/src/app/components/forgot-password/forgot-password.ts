import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPasswordComponent implements OnInit {
  step: number = 1;
  email: string = '';
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Vérifier si un token est dans l'URL
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.token = params['token'];
        this.step = 3; // Aller directement à l'étape 3
        this.validateToken(this.token);
      }
    });
  }

  // Étape 1: Demander la réinitialisation
  requestReset(): void {
    if (!this.email || !this.email.includes('@')) {
      this.errorMessage = 'Veuillez entrer un email valide';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post('http://localhost:8080/api/password-reset/request', {
      email: this.email
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.success) {
          this.step = 2;
          this.successMessage = 'Token généré. Consultez la console backend.';
        } else {
          this.errorMessage = response.message || 'Erreur';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Erreur serveur';
      }
    });
  }


  validateToken(token: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.get(`http://localhost:8080/api/password-reset/validate-token?token=${token}`).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.valid) {
          this.step = 3;
        } else {
          this.errorMessage = 'invalide ou expiré';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Erreur de validation';
      }
    });
  }

  // Étape 3: Réinitialiser le mot de passe
  resetPassword(): void {
    if (!this.newPassword || this.newPassword.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post('http://localhost:8080/api/password-reset/reset', {
      token: this.token,
      newPassword: this.newPassword
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = 'Mot de passe réinitialisé avec succès! Redirection...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMessage = response.message || 'Erreur';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Erreur serveur';
      }
    });
  }
  // Dans votre classe ForgotPasswordComponent

  newPasswordType: string = 'password';
  confirmPasswordType: string = 'password';

// Basculer la visibilité du mot de passe
  togglePasswordVisibility(field: string): void {
    if (field === 'newPassword') {
      this.newPasswordType = this.newPasswordType === 'password' ? 'text' : 'password';
    } else if (field === 'confirmPassword') {
      this.confirmPasswordType = this.confirmPasswordType === 'password' ? 'text' : 'password';
    }
  }

// Obtenir l'icône appropriée
  getVisibilityIcon(field: string): string {
    if (field === 'newPassword') {
      return this.newPasswordType === 'password' ? 'fa-eye' : 'fa-eye-slash';
    } else if (field === 'confirmPassword') {
      return this.confirmPasswordType === 'password' ? 'fa-eye' : 'fa-eye-slash';
    }
    return 'fa-eye';
  }

  // Retour à l'étape précédente
  back(): void {
    if (this.step > 1) {
      this.step--;
      this.errorMessage = '';
      this.successMessage = '';
    }
  }
}
