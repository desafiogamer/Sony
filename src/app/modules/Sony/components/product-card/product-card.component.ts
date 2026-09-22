import { Component, Input, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { productInterface } from '../../interfaces/products.interface';
import { CartService } from '../../../../core/services/cart.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: productInterface;
  @Input() index = 0;

  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);

  public readonly added = signal(false);

  public get descontoPercentual(): number {
    if (!this.product.oldPrice) return 0;
    return Math.round((1 - this.product.price / this.product.oldPrice) * 100);
  }

  public get estrelas(): number[] {
    return [0, 1, 2, 3, 4];
  }

  public adicionar(): void {
    this.cart.add(this.product);
    this.toast.show('Adicionado ao carrinho', this.product.nome, this.product.image);

    this.added.set(true);
    setTimeout(() => this.added.set(false), 1400);
  }

  public verCarrinho(): void {
    this.cart.open();
  }
}
