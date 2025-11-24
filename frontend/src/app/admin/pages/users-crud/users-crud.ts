/*import { Component, OnInit  } from '@angular/core';
import { Users } from '../../../services/users';
import { User } from '../../../models/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-crud.html',
  styleUrl: './users-crud.css',
})
export class UsersAdmin implements OnInit{
  //usersAdmin: User[] = [];
  usersAdmin: any[] = [];
  selectedUser: User | null = null;
  isEditing: boolean = false;

  newUser: User = {
    username: '',
    email: '',
    password: '',
    role: 'client'
  };

  constructor() { //pour tester
    
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.users.getUsers().subscribe({
      next: (data) => this.usersAdmin = data,
      error: (err) => console.error('Erreur chargement users:', err)
    });
  }

  createUser(): void {
    this.users.createUser(this.newUser).subscribe({
      next: (user) => {
        this.usersAdmin.push(user);
        this.resetForm();
        alert('Utilisateur créé avec succès !');
      },
      error: (err) => console.error('Erreur création:', err)
    });
  }

  editUser(user: User): void {
    this.selectedUser = { ...user };
    this.isEditing = true;
  }

  updateUser(): void {
    if (this.selectedUser && this.selectedUser.id) {
      this.users.updateUser(this.selectedUser.id, this.selectedUser).subscribe({
        next: () => {
          this.loadUsers();
          this.cancelEdit();
          alert('Utilisateur modifié avec succès !');
        },
        error: (err) => console.error('Erreur modification:', err)
      });
    }
  }

  deleteUser(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      this.users.deleteUser(id).subscribe({
        next: () => {
          this.usersAdmin = this.usersAdmin.filter(u => u.id !== id);
          alert('Utilisateur supprimé !');
        },
        error: (err) => console.error('Erreur suppression:', err)
      });
    }
  }

  cancelEdit(): void {
    this.selectedUser = null;
    this.isEditing = false;
  }

  resetForm(): void {
    this.newUser = {
      username: '',
      email: '',
      password: '',
      role: 'client'
    };
  }


}
*/
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],  // ✅ Import des modules
  templateUrl: './users-crud.html',
  styleUrl: './users-crud.css'
})
export class UsersAdmin implements OnInit {
  isEditing = false;
  selectedUser: any = null;
  users: any[] = [];
  
  newUser = { username: '', email: '', password: '', role: 'client' };

  constructor() {
    this.users = [
      { id: 1, username: 'user1', email: 'user1@test.com', role: 'client' },
      { id: 2, username: 'admin1', email: 'admin@test.com', role: 'admin' }
    ];
  }

  ngOnInit(): void {}

  createUser() {
    const user = { ...this.newUser, id: Date.now() };
    this.users.push(user);
    this.newUser = { username: '', email: '', password: '', role: 'client' };
  }

  editUser(user: any) {
    this.selectedUser = { ...user };
    this.isEditing = true;
  }

  updateUser() {
    if (this.selectedUser) {
      const index = this.users.findIndex(u => u.id === this.selectedUser.id);
      if (index !== -1) {
        this.users[index] = { ...this.selectedUser };
      }
      this.cancelEdit();
    }
  }

  cancelEdit() {
    this.isEditing = false;
    this.selectedUser = null;
  }

  deleteUser(user: any) {
    this.users = this.users.filter(u => u.id !== user.id);
  }
  get roles(): string[] {
    return ['admin', 'magasinier', 'client'];
  }

}