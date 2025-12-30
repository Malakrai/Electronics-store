import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['roles'] as Array<string>;
    const user = this.authService.getCurrentUser();

    if (this.authService.isAuthenticated() && user && expectedRoles.includes(user.userType)) {
      return true;
    } else {
      // Rediriger vers le dashboard approprié ou login
      this.router.navigate(['/login']);
      return false;
    }
  }
}
