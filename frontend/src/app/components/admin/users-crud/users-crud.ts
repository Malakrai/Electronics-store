import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TitleCasePipe } from '@angular/common';
import { UsersAdminService } from '../../../services/users.service';

@Component({
  selector: 'app-users-crud',
  standalone: true,
  imports: [FormsModule, CommonModule, TitleCasePipe],
  templateUrl: './users-crud.html',
  styleUrls: ['./users-crud.css']
})
export class UsersAdmin implements OnInit {

  users: any[] = [];
  isEditing = false;
  selectedUser: any = null;
  loading = false;

  currentUser = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: ''
  };

  roles = ['magasinier', 'admin', 'manager'];

  constructor(private usersService: UsersAdminService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.usersService.getUsers().subscribe({
      next: (res: any) => {
        console.log('Données reçues:', res);
        // Vérifier la structure de la réponse
        if (Array.isArray(res)) {
          this.users = res;
        } else if (res && Array.isArray(res.data)) {
          this.users = res.data; // Si l'API retourne { data: [...] }
        } else if (res && res.users) {
          this.users = res.users; // Si l'API retourne { users: [...] }
        } else {
          this.users = [];
          console.warn('Format de données non reconnu:', res);
        }
        console.log('Utilisateurs chargés:', this.users.length);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement utilisateurs', err);
        this.users = [];
        this.loading = false;
        alert('Erreur lors du chargement des utilisateurs');
      }
    });
  }

  createUser() {
    if (!this.currentUser.firstName || !this.currentUser.lastName || !this.currentUser.email || !this.currentUser.password || !this.currentUser.role) {
      alert('Tous les champs sont obligatoires.');
      return;
    }

    // Vérifier si l'email existe déjà
    if (this.users.some(user => user.email === this.currentUser.email)) {
      alert('Cet email est déjà utilisé.');
      return;
    }

    const payload = {
      firstName: this.currentUser.firstName,
      lastName: this.currentUser.lastName,
      email: this.currentUser.email,
      password: this.currentUser.password,
      role: this.currentUser.role,
      // Ajoutez d'autres champs requis par votre API
      createdAt: new Date().toISOString(),
      active: true
    };

    console.log('Création avec payload:', payload);

    this.usersService.createUser(payload).subscribe({
      next: (res: any) => {
        console.log('Réponse création:', res);

        // Ajouter le nouvel utilisateur à la liste
        // Vérifier la structure de la réponse
        const newUser = res.user || res.data || res;
        if (newUser) {
          this.users.push(newUser);
          this.users = [...this.users]; // Créer une nouvelle référence
        }

        this.resetForm();
        alert('Utilisateur créé avec succès !');
      },
      error: (err: any) => {
        console.error('Erreur création:', err);
        alert('Erreur lors de la création : ' + (err.error?.message || err.message || 'Erreur inconnue'));
      }
    });
  }

  editUser(user: any) {
    this.isEditing = true;
    this.selectedUser = user;
    this.currentUser = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: '', // Ne pas afficher le mot de passe
      role: user.role || ''
    };
  }

  updateUser() {
    if (!this.currentUser.firstName || !this.currentUser.lastName || !this.currentUser.email || !this.currentUser.role) {
      alert('Tous les champs sont obligatoires.');
      return;
    }

    if (!this.selectedUser || !this.selectedUser.id) {
      alert('Utilisateur non sélectionné pour la modification');
      return;
    }

    const payload = {
      firstName: this.currentUser.firstName,
      lastName: this.currentUser.lastName,
      email: this.currentUser.email,
      role: this.currentUser.role,
      // Inclure le mot de passe seulement s'il a été modifié
      ...(this.currentUser.password && { password: this.currentUser.password })
    };

    this.usersService.updateUser(this.selectedUser.id, payload).subscribe({
      next: (res: any) => {
        // Mettre à jour l'utilisateur dans la liste
        const index = this.users.findIndex(u => u.id === this.selectedUser.id);
        if (index !== -1) {
          const updatedUser = res.user || res.data || res;
          this.users[index] = { ...this.users[index], ...updatedUser };
          this.users = [...this.users];
        }

        this.resetForm();
        alert('Utilisateur mis à jour avec succès !');
      },
      error: (err: any) => {
        console.error('Erreur mise à jour:', err);
        alert('Erreur lors de la mise à jour : ' + err.error?.message || err.message);
      }
    });
  }

  deleteUser(user: any) {
    if (!user.id) {
      alert('Impossible de supprimer: ID manquant');
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer ${user.firstName} ${user.lastName} ?`)) {
      this.usersService.deleteUser(user.id).subscribe({
        next: () => {
          // Supprimer de la liste locale
          this.users = this.users.filter(u => u.id !== user.id);
          alert('Utilisateur supprimé avec succès.');
        },
        error: (err: any) => {
          console.error('Erreur suppression:', err);
          alert('Erreur lors de la suppression : ' + err.error?.message || err.message);
        }
      });
    }
  }

  cancelEdit() {
    this.resetForm();
  }

  resetForm() {
    this.isEditing = false;
    this.selectedUser = null;
    this.currentUser = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: ''
    };
  }
}
