import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, TitleCasePipe } from '@angular/common';
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

  roles = ['MAGASINIER', 'ADMIN', 'MANAGER'];

  constructor(private usersService: UsersAdminService) {}

  ngOnInit() {
    this.loadUsers();
  }

  // ✅ Normalise pour que l'affichage marche même si le backend renvoie userType
  private normalizeUser(u: any) {
    return {
      ...u,
      firstName: u?.firstName ?? '',
      lastName: u?.lastName ?? '',
      email: u?.email ?? '',
      role: u?.role ?? u?.userType ?? ''  // 🔥 important
    };
  }

  private extractUsers(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    if (res && Array.isArray(res.users)) return res.users;
    return [];
  }

  loadUsers() {
    this.loading = true;

    this.usersService.getUsers().subscribe({
      next: (res: any) => {
        const rawUsers = this.extractUsers(res);
        this.users = rawUsers.map(u => this.normalizeUser(u));
        this.loading = false;

        console.log('Utilisateurs chargés:', this.users);
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

    // ⚠️ check local (optionnel)
    if (this.users.some(user => user.email === this.currentUser.email)) {
      alert('Cet email est déjà utilisé.');
      return;
    }

    // ✅ Payload EXACT = AdminCreateUserDto
    const payload = {
      firstName: this.currentUser.firstName,
      lastName: this.currentUser.lastName,
      email: this.currentUser.email,
      password: this.currentUser.password,
      role: this.currentUser.role
    };

    console.log('Création avec payload:', payload);

    this.usersService.createUser(payload).subscribe({
      next: (res: any) => {
        console.log('Réponse création:', res);

        // Ton controller renvoie {message,id,email,userType}
        // Donc on reconstruit un user affichable
        const createdUser = this.normalizeUser({
          id: res?.id,
          email: res?.email,
          userType: res?.userType,
          firstName: payload.firstName,
          lastName: payload.lastName
        });

        this.users.push(createdUser);
        this.users = [...this.users];

        this.resetForm();
        alert('Utilisateur créé avec succès !');
      },
      error: (err: any) => {
        console.error('Erreur création:', err);
        alert('Erreur lors de la création : ' + (err.error?.error || err.error?.message || err.message || 'Erreur inconnue'));
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
      password: '',
      role: user.role || user.userType || ''
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

    
    const payload: any = {
      firstName: this.currentUser.firstName,
      lastName: this.currentUser.lastName,
      email: this.currentUser.email,
      role: this.currentUser.role
    };

    
    if (this.currentUser.password && this.currentUser.password.trim().length > 0) {
      payload.password = this.currentUser.password;
    }

    this.usersService.updateUser(this.selectedUser.id, payload).subscribe({
      next: (res: any) => {
        console.log('Réponse update:', res);

        const index = this.users.findIndex(u => u.id === this.selectedUser.id);
        if (index !== -1) {
          const updated = this.normalizeUser({
            ...this.users[index],
            ...payload,
            ...(res?.user || res?.data || res) // si backend renvoie un user complet
          });

          this.users[index] = updated;
          this.users = [...this.users];
        }

        this.resetForm();
        alert('Utilisateur mis à jour avec succès !');
      },
      error: (err: any) => {
        console.error('Erreur mise à jour:', err);
        alert('Erreur lors de la mise à jour : ' + (err.error?.error || err.error?.message || err.message || 'Erreur inconnue'));
      }
    });
  }

  deleteUser(user: any) {
    if (!user?.id) {
      alert('Impossible de supprimer: ID manquant');
      return;
    }

    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

    if (confirm(`Êtes-vous sûr de vouloir supprimer ${fullName || user.email} ?`)) {
      this.usersService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          alert('Utilisateur supprimé avec succès.');
        },
        error: (err: any) => {
          console.error('Erreur suppression:', err);
          alert('Erreur lors de la suppression : ' + (err.error?.error || err.error?.message || err.message || 'Erreur inconnue'));
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
