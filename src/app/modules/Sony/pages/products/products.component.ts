import { Component, Input, signal } from '@angular/core';

//components
import { LinhasComponent } from '../../components/linhas/linhas.component';
import { ContainerImgsComponent } from '../../components/container-imgs/container-imgs.component';

//interfaces
import { productInterface } from '../../interfaces/products.interface';



@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    LinhasComponent,
    ContainerImgsComponent,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  @Input() produtos = signal<productInterface[]>([]);
  public src:string = 'assets/img/spider2.webp'
  public alt:string = 'Homem Aranhas'
}
