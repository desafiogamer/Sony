import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

//components
import { LinhasComponent } from '../../components/linhas/linhas.component';
import { ContainerImgsComponent } from '../../components/container-imgs/container-imgs.component';
import { CarouselComponent } from '../../../../components/carousel/carousel.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

//services
import { ProductsService } from '../../../../core/services/products.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    RouterModule,
    LinhasComponent,
    ContainerImgsComponent,
    CarouselComponent,
    ProductCardComponent
  ],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  private readonly productsService = inject(ProductsService);

  public src = 'assets/img/godofwar.webp';
  public alt = 'God of War';

  /** Quatro jogos em destaque na home. */
  public readonly destaques = computed(() => this.productsService.products().slice(0, 4));

  public readonly stats = [
    { valor: '+120', rotulo: 'jogos no catálogo' },
    { valor: '4.9', rotulo: 'avaliação média' },
    { valor: '24h', rotulo: 'entrega digital' }
  ];
}
