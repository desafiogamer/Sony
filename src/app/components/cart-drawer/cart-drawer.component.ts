import { Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';

const FRETE_GRATIS_A_PARTIR_DE = 199;

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CurrencyPipe, RouterModule],
  templateUrl: './cart-drawer.component.html',
  styleUrl: './cart-drawer.component.css'
})
export class CartDrawerComponent {
  public readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);

  public readonly freteGratisAPartirDe = FRETE_GRATIS_A_PARTIR_DE;
  public readonly finalizando = signal(false);

  public readonly faltaParaFreteGratis = computed(() =>
    Math.max(0, FRETE_GRATIS_A_PARTIR_DE - this.cart.subtotal())
  );

  public readonly progressoFrete = computed(() =>
    Math.min(100, (this.cart.subtotal() / FRETE_GRATIS_A_PARTIR_DE) * 100)
  );

  constructor() {
    effect(() => {
      document.body.classList.toggle('no-scroll', this.cart.isOpen());
    });
  }

  @HostListener('document:keydown.escape')
  public onEscape(): void {
    this.cart.close();
  }

  public finalizar(): void {
    if (!this.cart.items().length) return;

    this.finalizando.set(true);

    setTimeout(() => {
      this.finalizando.set(false);
      this.toast.show('Pedido confirmado', 'Seus jogos já estão disponíveis na biblioteca.');
      this.cart.clear();
      this.cart.close();
    }, 1100);
  }
}
