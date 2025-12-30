import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-profile.html',
  styleUrls: ['./customer-profile.css']
})
export class CustomerProfileComponent implements OnInit {

  profileForm!: FormGroup;
  profileImage: string = 'assets/default-avatar.png';
  selectedFile!: File;
  message: string = '';

  private apiUrl = 'http://localhost:8080/api/customer';
  private token = localStorage.getItem('token');

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Création du formulaire
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: [''],
      address: ['']
    });
    this.getProfile(); // récupérer les infos du profil
  }

  getProfile() {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    this.http.get<any>(`${this.apiUrl}/profile`, { headers }).subscribe({
      next: res => {
        // remplir le formulaire avec les données existantes
        this.profileForm.patchValue({
          firstName: res.firstName,
          lastName: res.lastName,
          phone: res.phone,
          address: res.address
        });

        // afficher la photo
        this.profileImage = res.profileImage
          ? `http://localhost:8080/images/${res.profileImage}`
          : 'assets/default-avatar.png';
      },
      error: err => console.error(err)
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];

    // prévisualisation immédiate
    const reader = new FileReader();
    reader.onload = e => this.profileImage = reader.result as string;
    reader.readAsDataURL(this.selectedFile);

    this.uploadImage();
  }

  uploadImage() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    this.http.post<any>(`${this.apiUrl}/profile/image`, formData, { headers }).subscribe({
      next: res => {
        this.profileImage = `http://localhost:8080/images/${res.image}`;
        this.message = 'Photo de profil mise à jour !';
      },
      error: err => {
        console.error(err);
        this.message = 'Erreur lors du téléchargement de la photo';
      }
    });
  }
  goBack() {
    this.router.navigate(['/dashboard']); // remplace /dashboard par ta route cible
  }
  saveProfile() {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    this.http.put<any>(`${this.apiUrl}/profile`, this.profileForm.value, { headers }).subscribe({
      next: res => this.message = 'Profil mis à jour avec succès !',
      error: err => {
        console.error(err);
        this.message = 'Erreur lors de la mise à jour du profil';
      }
    });
  }
}
