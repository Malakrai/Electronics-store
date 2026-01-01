import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent {
  cartCount$!: Observable<number>;

  constructor(private cartService: CartService) {
    this.cartCount$ = this.cartService.items$.pipe(
    map(items => items.reduce((sum, i) => sum + i.quantity, 0))
  )
  }
}
