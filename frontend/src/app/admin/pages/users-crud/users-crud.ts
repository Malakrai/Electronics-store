import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users-crud',
  standalone: true,
  imports: [FormsModule], 
  templateUrl: './users-crud.html',
  styleUrl: './users-crud.css'
})
export class UsersAdmin implements OnInit {
  isEditing = false;
  selectedUser: any = null;
  users: any[] = [];
  
  newUser = { username: '', email: '', password: '', role: 'magasinier' };

  constructor() {
    this.users = [
      { id: 1, username: 'user1', email: 'user1@test.com', role: 'magasinier' },
    ];
  }

  ngOnInit(): void {}

  createUser() {
    const user = { ...this.newUser, id: Date.now() };
    this.users.push(user);
    this.newUser = { username: '', email: '', password: '', role: 'magasinier' };
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
    return ['magasinier'];
  }

}

