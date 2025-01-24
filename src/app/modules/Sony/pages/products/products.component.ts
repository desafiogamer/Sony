import { Component, Input, signal } from '@angular/core';

//components
import { LinhasComponent } from '../../components/linhas/linhas.component';
import { ContainerImgsComponent } from '../../components/container-imgs/container-imgs.component';
import { productInterface } from '../../interfaces/products.interface';
import { ListaProductsComponent } from '../../components/lista-products/lista-products.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    LinhasComponent,
    ContainerImgsComponent,
    ListaProductsComponent,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  @Input() produtos = signal<productInterface[]>([]);
  public src:string = 'assets/img/joel.png'
  public alt:string = 'Homem Aranhas'
}
