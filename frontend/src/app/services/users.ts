import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';


@Injectable({
  providedIn: 'root',
})
export class Users {
  private apiUrl = 'http://localhost:3000/api/users'; // Change selon ton backend

  constructor(private http: HttpClient) { }

  // GET tous les utilisateurs
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  // GET un utilisateur par ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // POST créer un utilisateur
  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  // PUT modifier un utilisateur
  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  // DELETE supprimer un utilisateur
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
