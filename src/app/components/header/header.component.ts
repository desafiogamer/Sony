import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  public readonly cart = inject(CartService);

  public readonly scrolled = signal(false);
  public readonly menuOpen = signal(false);

  @HostListener('window:scroll')
  public onScroll(): void {
    this.scrolled.set(window.scrollY > 24);
  }

  public toggleMenu(): void {
    this.menuOpen.update(open => !open);
  }

  public closeMenu(): void {
    this.menuOpen.set(false);
  }
}
