import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsersAdminService } from '../../../services/users.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-users-crud',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
        console.log('Réponse API magasiniers complète:', response);

        // Débogage de la structure de réponse
        console.log('Type de réponse:', typeof response);
        console.log('Est un tableau?', Array.isArray(response));

        let magasiniers = [];

        // Gestion de différentes structures de réponse possibles
        if (Array.isArray(response)) {
          magasiniers = response;
        }
        else if (response && Array.isArray(response.data)) {
          magasiniers = response.data;
        }
        else if (response && Array.isArray(response.users)) {
          magasiniers = response.users;
        }
        else if (response && Array.isArray(response.content)) {
          magasiniers = response.content; // Pour pagination
        }
        else if (response && response.message) {
          // Si l'API retourne un message de succès avec données
          magasiniers = response.data || response.users || [];
        }
        else {
          console.warn('Format de réponse inattendu:', response);
          magasiniers = [];
        }

        console.log('Magasiniers extraits:', magasiniers);

        // Normaliser et assigner les utilisateurs
        this.users = magasiniers.map((user: any) => this.normalizeUser(user));

        this.loading = false;
        console.log('Magasiniers après normalisation:', this.users);
      },
      error: (error: any) => {
        console.error('Erreur détaillée:', error);
        this.errorMessage = 'Erreur lors du chargement des magasiniers: ' +
                           (error.error?.message || error.message || 'Erreur inconnue');
        this.loading = false;
        this.autoClearMessages();
      }
    });
  }

  private normalizeUser(user: any): any {
    console.log('Normalisation de l\'utilisateur:', user);

    // Extraction sécurisée des données
    return {
      id: user.id || user._id || user.userId || user.userID || null,
      firstName: user.firstName || user.firstname || user.prenom || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.lastname || user.nom || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email || user.mail || user.username || '',
      role: user.role || user.userRole || user.authorities?.[0] || 'MAGASINIER',
      userType: user.userType || user.type || user.user_type || 'MAGASINIER',
      phone: user.phone || user.telephone || user.tel || user.phoneNumber || '',
      address: user.address || user.adresse || user.location || ''
    };
  }

  createUser(): void {
    if (!this.validateForm()) return;
    if (!this.isAdminUser) return;

    this.loading = true;
    this.clearMessagesImmediate();

    // CORRECTION IMPORTANTE : RETIRER LE CHAMP "role"
    const magasinierData = {
      firstName: this.formData.firstName.trim(),
      lastName: this.formData.lastName.trim(),
      email: this.formData.email.trim().toLowerCase(),
      password: this.formData.password
      // SUPPRIMER : role: 'MAGASINIER'
    };

    console.log('Création magasinier avec données (sans role):', magasinierData);

    this.usersService.createMagasinier(magasinierData).subscribe({
      next: (res: any) => {
        console.log('✅ Réponse création:', res);

        // IMPORTANT: Recharger la liste complète depuis l'API
        this.loadUsers();

        this.resetForm();
        this.successMessage = 'Magasinier créé avec succès !';
        this.loading = false;
        this.autoClearMessages();
      },
      error: (error: any) => {
        console.error('❌ Erreur création détaillée:', error);

        // Messages d'erreur plus détaillés
        let errorMsg = 'Erreur lors de la création';

        if (error.status === 400) {
          if (error.error?.message) {
            errorMsg = error.error.message;
          } else if (error.error) {
            errorMsg = 'Données invalides : ' + JSON.stringify(error.error);
          } else {
            errorMsg = 'Les données envoyées sont invalides';
          }
        } else if (error.status === 401) {
          errorMsg = 'Session expirée. Veuillez vous reconnecter.';
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          errorMsg = 'Accès interdit. Vous n\'avez pas les permissions nécessaires.';
        } else if (error.status === 409) {
          errorMsg = 'Cet email est déjà utilisé par un autre utilisateur.';
        } else {
          errorMsg = error.error?.message || error.message || 'Erreur serveur';
        }

        this.errorMessage = errorMsg;
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

    console.log('Édition de l\'utilisateur:', user);
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
      // Ne pas inclure "role" ici non plus
    };

    if (this.formData.password && this.formData.password.trim().length >= 6) {
      updateData.password = this.formData.password;
    }

    console.log('Mise à jour magasinier ID:', this.selectedUser.id, 'Data:', updateData);

    this.usersService.updateMagasinier(this.selectedUser.id.toString(), updateData).subscribe({
      next: (res: any) => {
        console.log('Réponse mise à jour:', res);

        // Recharger la liste depuis l'API
        this.loadUsers();

        this.resetForm();
        this.successMessage = 'Magasinier mis à jour avec succès !';
        this.loading = false;
        this.autoClearMessages();
      },
      error: (error: any) => {
        console.error('Erreur mise à jour:', error);

        let errorMsg = 'Erreur lors de la mise à jour';

        if (error.status === 400) {
          errorMsg = 'Données invalides. Vérifiez les informations saisies.';
          if (error.error?.message) {
            errorMsg = error.error.message;
          }
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        } else if (error.message) {
          errorMsg = error.message;
        }

        this.errorMessage = errorMsg;
        this.loading = false;
        this.autoClearMessages();
      }
    });
  }

  deleteUser(user: any): void {
    if (!user.id) {
      this.errorMessage = 'ID manquant pour la suppression';
      this.autoClearMessages();
      return;
    }

    if (!this.isAdminUser) return;

    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    const displayName = fullName || user.email || 'ce magasinier';

    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${displayName} ? Cette action est irréversible.`)) {
      return;
    }

    this.loadingUserId = user.id;
    this.clearMessagesImmediate();

    this.usersService.deleteMagasinier(user.id.toString()).subscribe({
      next: () => {
        // Retirer l'utilisateur de la liste localement
        this.users = this.users.filter(u => u.id !== user.id);
        this.successMessage = 'Magasinier supprimé avec succès !';
        this.loadingUserId = null;
        this.autoClearMessages();
      },
      error: (error: any) => {
        console.error('Erreur suppression:', error);
        this.errorMessage = 'Erreur: ' +
                           (error.error?.error ||
                            error.error?.message ||
                            error.message ||
                            'Erreur lors de la suppression');
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

    // Validation des champs obligatoires
    if (!firstName || !lastName || !email) {
      this.errorMessage = 'Tous les champs marqués d\'un * sont requis';
      this.autoClearMessages();
      return false;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.errorMessage = 'Veuillez entrer une adresse email valide';
      this.autoClearMessages();
      return false;
    }

    // Validation mot de passe (seulement pour la création)
    if (!isUpdate && (!password || password.length < 6)) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      this.autoClearMessages();
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

  clearMessagesImmediate(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private autoClearMessages(): void {
    setTimeout(() => {
      this.clearMessagesImmediate();
    }, 5000); // 5 secondes
  }
}
