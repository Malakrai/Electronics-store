import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersAdminService } from '../../../services/users.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-users-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-crud.html',
  styleUrls: ['./users-crud.css']
})
export class UsersAdmin implements OnInit {

  users: any[] = [];
  selectedUser: any = null;
  isEditing = false;
  loading = false;
  loadingUserId: number | null = null;
  errorMessage = '';
  successMessage = '';
  isAdminUser = false;

  formData = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  };

  constructor(
    private usersService: UsersAdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.debugAuth();
    this.checkAdminAccess();
  }

  private debugAuth(): void {
    console.log('=== DEBUG AUTH ===');
    console.log('Token:', localStorage.getItem('token'));
    console.log('User:', localStorage.getItem('user'));

    const user = this.authService.getCurrentUser();
    console.log('Current User:', user);
    console.log('User Role:', this.authService.getUserRole());
    console.log('Is Admin?', this.authService.isAdmin());
    console.log('=== FIN DEBUG ===');
  }

  private checkAdminAccess(): void {
    console.log('=== CHECK ADMIN ACCESS ===');

    if (!this.authService.isAuthenticated()) {
      console.log('Non authentifié');
      alert('Veuillez vous connecter pour accéder à cette page');
      this.router.navigate(['/login']);
      return;
    }

    this.isAdminUser = this.authService.isAdmin();
    console.log('isAdminUser =', this.isAdminUser);

    if (!this.isAdminUser) {
      const userRole = this.authService.getUserRole();
      alert(`Accès refusé : Votre rôle est "${userRole || 'NON DÉFINI'}" mais vous devez être "ADMIN"`);
      this.router.navigate(['/dashboard']);
      return;
    }

    console.log('Accès admin autorisé');
    this.loadUsers();
  }

  loadUsers(): void {
    if (!this.isAdminUser) return;

    this.loading = true;
    this.clearMessagesImmediate();

    console.log('Chargement des magasiniers...');

    this.usersService.getMagasiniers().subscribe({
      next: (response: any) => {
        console.log('Réponse API magasiniers:', response);

        if (Array.isArray(response)) {
          this.users = response.map((user: any) => this.normalizeUser(user));
        }
        else if (response && Array.isArray(response.data)) {
          this.users = response.data.map((user: any) => this.normalizeUser(user));
        }
        else if (response && Array.isArray(response.users)) {
          this.users = response.users.map((user: any) => this.normalizeUser(user));
        }
        else {
          this.users = [];
        }

        this.loading = false;
        console.log('Magasiniers chargés:', this.users);
      },
      error: (error: any) => {
        console.error('Erreur:', error);
        this.errorMessage = 'Erreur: ' + (error.error?.message || error.message);
        this.loading = false;
        this.autoClearMessages();
      }
    });
  }

  private normalizeUser(user: any): any {
    return {
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      role: 'MAGASINIER',
      userType: user.userType || 'MAGASINIER',
      phone: user.phone || '',
      address: user.address || ''
    };
  }

  createUser(): void {
    if (!this.validateForm()) return;
    if (!this.isAdminUser) return;

    this.loading = true;
    this.clearMessagesImmediate();

    const magasinierData = {
      firstName: this.formData.firstName.trim(),
      lastName: this.formData.lastName.trim(),
      email: this.formData.email.trim().toLowerCase(),
      password: this.formData.password
    };

    console.log('Création magasinier:', magasinierData);

    this.usersService.createMagasinier(magasinierData).subscribe({
      next: (res: any) => {
        console.log('Réponse création:', res);

        const newMagasinier = this.normalizeUser({
          id: res?.id,
          firstName: magasinierData.firstName,
          lastName: magasinierData.lastName,
          email: magasinierData.email
        });

        this.users.push(newMagasinier);
        this.resetForm();
        this.successMessage = 'Magasinier créé avec succès';
        this.loading = false;
        this.autoClearMessages();
      },
      error: (error: any) => {
        console.error('Erreur création:', error);
        this.errorMessage = error.error?.error || error.error?.message || error.message || 'Erreur lors de la création';
        this.loading = false;
        this.autoClearMessages();
      }
    });
  }

  editUser(user: any): void {
    this.isEditing = true;
    this.selectedUser = { ...user };

    this.formData = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: ''
    };
  }

  updateUser(): void {
    if (!this.validateForm(true) || !this.selectedUser || !this.selectedUser.id) return;
    if (!this.isAdminUser) return;

    this.loading = true;
    this.clearMessagesImmediate();

    const updateData: any = {
      firstName: this.formData.firstName.trim(),
      lastName: this.formData.lastName.trim(),
      email: this.formData.email.trim().toLowerCase()
    };

    if (this.formData.password && this.formData.password.trim().length > 0) {
      updateData.password = this.formData.password;
    }

    console.log('Update magasinier ID:', this.selectedUser.id, 'Data:', updateData);

    this.usersService.updateMagasinier(this.selectedUser.id.toString(), updateData).subscribe({
      next: (res: any) => {
        console.log('Réponse update:', res);

        const index = this.users.findIndex(u => u.id === this.selectedUser.id);
        if (index !== -1) {
          this.users[index] = { ...this.users[index], ...updateData };
          this.users = [...this.users];
        }

        this.resetForm();
        this.successMessage = 'Magasinier mis à jour';
        this.loading = false;
        this.autoClearMessages();
      },
      error: (error: any) => {
        console.error('Erreur update:', error);
        this.errorMessage = error.error?.error || error.error?.message || error.message || 'Erreur lors de la mise à jour';
        this.loading = false;
        this.autoClearMessages();
      }
    });
  }

  deleteUser(user: any): void {
    if (!user.id) {
      alert('ID manquant');
      return;
    }

    if (!this.isAdminUser) return;

    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if (!confirm(`Supprimer le magasinier ${fullName || user.email} ?`)) return;

    this.loadingUserId = user.id;
    this.clearMessagesImmediate();

    this.usersService.deleteMagasinier(user.id.toString()).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== user.id);
        this.successMessage = 'Magasinier supprimé';
        this.loadingUserId = null;
        this.autoClearMessages();
      },
      error: (error: any) => {
        console.error('Erreur suppression:', error);
        this.errorMessage = error.error?.error || error.error?.message || error.message || 'Erreur lors de la suppression';
        this.loadingUserId = null;
        this.autoClearMessages();
      }
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private validateForm(isUpdate = false): boolean {
    const { firstName, lastName, email, password } = this.formData;

    if (!firstName || !lastName || !email) {
      this.errorMessage = 'Tous les champs sont requis';
      return false;
    }

    if (!isUpdate && (!password || password.length < 6)) {
      this.errorMessage = 'Mot de passe minimum 6 caractères';
      return false;
    }

    return true;
  }

  private resetForm(): void {
    this.isEditing = false;
    this.selectedUser = null;
    this.formData = {
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    };
  }

  // ✅ CORRECTION: Changez cette méthode en publique
  clearMessagesImmediate(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private autoClearMessages(): void {
    setTimeout(() => {
      this.clearMessagesImmediate();
    }, 4000);
  }
}
