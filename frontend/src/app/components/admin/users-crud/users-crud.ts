import { Component } from '@angular/core';
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
export class UsersAdmin {

  users: any[] = [];
  isEditing = false;
  selectedUser: any = null;

  // Utilisateur courant pour creation/edition
  currentUser = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: ''
  };

  roles = ['magasinier', 'admin', 'manager'];

  constructor(private usersService: UsersAdminService) {
    this.loadUsers();
  }

  loadUsers() {
    this.usersService.getMagasiniers().subscribe({
      next: (res: any) => this.users = res,
      error: (err: any) => console.error('Erreur chargement utilisateurs', err)
    });
  }

  createUser() {
    if (!this.currentUser.firstName || !this.currentUser.lastName || !this.currentUser.email || !this.currentUser.password || !this.currentUser.role) {
      alert('Tous les champs sont obligatoires.');
      return;
    }

    const payload = { ...this.currentUser, employeeId: 'EMP-' + Date.now(), department: 'Stock' };

    this.usersService.createMagasinier(payload).subscribe({
      next: (res: any) => {
        this.users.push({ ...payload });
        this.resetForm();
        alert('Utilisateur créé avec succès !');
      },
      error: (err: any) => {
        console.error(err);
        alert('Erreur lors de la création : ' + (err.error?.message || err.message));
      }
    });
  }

  editUser(user: any) {
    this.isEditing = true;
    this.currentUser = { ...user }; // copie pour ne pas modifier directement
  }

  updateUser() {
    if (!this.currentUser.firstName || !this.currentUser.lastName || !this.currentUser.email || !this.currentUser.role) {
      alert('Tous les champs sont obligatoires.');
      return;
    }

    const index = this.users.findIndex(u => u.email === this.currentUser.email);
    if (index !== -1) this.users[index] = { ...this.currentUser };

    this.resetForm();
    alert('Utilisateur mis à jour avec succès !');
  }

  deleteUser(user: any) {
    if (confirm(`Supprimer ${user.firstName} ${user.lastName} ?`)) {
      this.users = this.users.filter(u => u.email !== user.email);
      alert('Utilisateur supprimé.');
    }
  }

  cancelEdit() {
    this.resetForm();
  }

  resetForm() {
    this.isEditing = false;
    this.currentUser = { firstName: '', lastName: '', email: '', password: '', role: '' };
    this.selectedUser = null;
  }
}
