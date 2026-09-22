import { Component, Input, inject } from '@angular/core';

import { ProductCardComponent } from '../product-card/product-card.component';
import { productInterface } from '../../interfaces/products.interface';
import { ProductsService } from '../../../../core/services/products.service';

/**
 * Grade reutilizável de produtos. Sem `products` informado, usa o catálogo completo.
 */
@Component({
  selector: 'app-lista-products',
  standalone: true,
  imports: [ProductCardComponent],
  templateUrl: './lista-products.component.html',
  styleUrl: './lista-products.component.css'
})
export class ListaProductsComponent {
  private readonly productsService = inject(ProductsService);

  @Input() products: productInterface[] | null = null;

  public get lista(): productInterface[] {
    return this.products ?? this.productsService.products();
  }
}
