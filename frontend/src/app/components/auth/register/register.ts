import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  emailExistsError: boolean = false;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Réinitialiser l'erreur d'email existant quand l'utilisateur modifie l'email
  onEmailChange(): void {
    if (this.emailExistsError) {
      this.emailExistsError = false;
      this.errorMessage = '';
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }

    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      this.emailExistsError = false;

      const formData = this.registerForm.value;

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      };

      console.log('Inscription client:', payload);

      this.http.post('/api/auth/customer/register', payload).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          console.log('Inscription réussie:', response);

          this.successMessage = 'Inscription réussie! Redirection vers la page de connexion...';
          this.errorMessage = '';
          this.emailExistsError = false;

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.successMessage = '';

          console.error('Erreur inscription:', error);

          // Vérifier si l'erreur concerne un email déjà existant
          if (error.status === 400 || error.status === 409) {
            const errorMsg = error.error?.error?.toLowerCase() || '';

            // Vérifier les différentes façons dont le serveur peut signaler un email existant
            if (
              errorMsg.includes('email') &&
              (errorMsg.includes('existe') ||
                errorMsg.includes('déjà') ||
                errorMsg.includes('already') ||
                errorMsg.includes('unique') ||
                errorMsg.includes('taken'))
            ) {
              this.emailExistsError = true;
              this.errorMessage = '';
            } else {
              this.emailExistsError = false;
              this.errorMessage = error.error.error || 'Erreur lors de l\'inscription';
            }
          } else if (error.status === 500) {
            this.emailExistsError = false;
            this.errorMessage = 'Erreur serveur. Veuillez réessayer.';
          } else {
            this.emailExistsError = false;
            this.errorMessage = `Erreur ${error.status}: ${error.statusText}`;
          }
        }
      });
    } else {
      this.markFormGroupTouched();
      this.errorMessage = 'Veuillez corriger les erreurs du formulaire';
      this.successMessage = '';
      this.emailExistsError = false;
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.emailExistsError = false;
  }
}
