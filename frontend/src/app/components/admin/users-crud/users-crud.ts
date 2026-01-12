import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersAdminService } from '../../../services/users.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-users-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-crud.html',
  styleUrls: ['./users-crud.css']
})
export class UsersAdmin implements OnInit {

  users: User[] = [];
  selectedUser: User | null = null;

  isEditing = false;
  loading = false;
  loadingUserId: number | null = null;

  errorMessage = '';
  successMessage = '';

  formData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  };

  constructor(private usersService: UsersAdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.clearMessagesImmediate();

    this.usersService.getMagasiniers().subscribe({
      next: users => {
        this.users = users || [];
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les utilisateurs';
        this.loading = false;
        this.autoClearMessages();
      }
    });
  }

  onSubmit(): void {
    this.isEditing ? this.updateUser() : this.createUser();
  }

  createUser(): void {
    if (!this.validateForm()) return;

    this.loading = true;
    this.clearMessagesImmediate();

    this.usersService.createMagasinier(this.prepareUserData()).subscribe({
      next: (res) => {
        this.users.push({
          id: res?.magasinierId || res?.id,
          ...this.prepareUserData(),
          role: 'MAGASINIER'
        });
        this.resetForm();
        this.successMessage = 'Utilisateur créé avec succès';
        this.loading = false;
        this.autoClearMessages();
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la création';
        this.loading = false;
        this.autoClearMessages();
      }
    });
  }

  editUser(user: User): void {
    this.isEditing = true;
    this.selectedUser = { ...user };

    this.formData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      phone: user.phone || '',
      address: user.address || ''
    };
  }

  updateUser(): void {
    if (!this.validateForm(true) || !this.selectedUser) return;

    this.loading = true;
    this.clearMessagesImmediate();

    this.usersService.updateUser(
      this.selectedUser.id!.toString(),
      this.prepareUserData(true)
    ).subscribe({
      next: () => {
        Object.assign(
          this.users.find(u => u.id === this.selectedUser!.id)!,
          this.prepareUserData(true)
        );
        this.resetForm();
        this.successMessage = 'Utilisateur mis à jour';
        this.loading = false;
        this.autoClearMessages();
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la mise à jour';
        this.loading = false;
        this.autoClearMessages();
      }
    });
  }

  deleteUser(user: User): void {
    if (!confirm(`Supprimer ${user.firstName} ${user.lastName} ?`)) return;

    this.loadingUserId = user.id!;
    this.clearMessagesImmediate();

    this.usersService.deleteUser(user.id!.toString()).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== user.id);
        this.successMessage = 'Utilisateur supprimé';
        this.loadingUserId = null;
        this.autoClearMessages();
      },
      error: () => {
        this.errorMessage = 'Erreur suppression';
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
      this.errorMessage = 'Tous les champs obligatoires doivent être remplis';
      return false;
    }

    if (!isUpdate && password.length < 6) {
      this.errorMessage = 'Mot de passe minimum 6 caractères';
      return false;
    }

    return true;
  }

  private prepareUserData(isUpdate = false): any {
    const data: any = {
      firstName: this.formData.firstName.trim(),
      lastName: this.formData.lastName.trim(),
      email: this.formData.email.trim().toLowerCase(),
      phone: this.formData.phone,
      address: this.formData.address
    };

    if (!isUpdate || this.formData.password) {
      data.password = this.formData.password;
    }

    return data;
  }

  private resetForm(): void {
    this.isEditing = false;
    this.selectedUser = null;
    this.formData = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      address: ''
    };
  }

  private clearMessagesImmediate(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private autoClearMessages(): void {
    setTimeout(() => {
      this.clearMessagesImmediate();
    }, 4000);
  }
}
