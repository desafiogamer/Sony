import { Component, signal } from '@angular/core';

//interfaces
import { productInterface } from '../../../../interfaces/products.interface';

@Component({
  selector: 'app-lista-produtos',
  standalone: true,
  imports: [],
  templateUrl: './lista-produtos.component.html',
  styleUrl: './lista-produtos.component.css'
})
export class ListaProdutosComponent {

  public products = signal<productInterface[]>([
    {
      id: 1,
      nome: 'Spider Man 2',
      lancamento: '22/03/2005',
      category: 'game',
      price: 249,
      image: './img/spider2.jpg',
      quantity: 1,
    },
    {
      id: 2,
      nome: 'Horizon Forbidden West',
      lancamento: '22/03/2005',
      category: 'game',
      price: 97,
      image: 'img/horizon2.jpg',
      quantity: 1,
    },
    {
      id: 3,
      nome: 'The Last of Us 2',
      lancamento: '22/03/2005',
      category: 'game',
      price: 193,
      image: 'img/the-last-of-us2.jpg',
      quantity: 1,
    },
    {
      id: 4,
      nome: 'Ghost of Tsushima',
      lancamento: '22/03/2005',
      category: 'game',
      price: 195,
      image: 'img/ghost-of-tsushima.png',
      quantity: 1,
    },
    {
      id: 5,
      nome: 'God of war 2018',
      lancamento: '22/03/2005',
      category: 'game',
      price: 99,
      image: 'img/god-of-war-2018.jpg',
      quantity: 1,
    },
    {
      id: 6,
      nome: 'God of war Ragnarok',
      lancamento: '22/03/2005',
      category: 'game',
      price: 349,
      image: 'img/godrag.jpg',
      quantity: 1,
    },
    {
      id: 7,
      nome: 'Death Stranding',
      lancamento: '22/03/2005',
      category: 'game',
      price: 94,
      image: 'img/death-stranding.jpg',
      quantity: 1,
    },
    {
      id: 8,
      nome: 'Bloodborne',
      lancamento: '22/03/2005',
      category: 'game',
      price: 88,
      image: 'img/bloodborne.jpg',
      quantity: 1,
    },
    {
      id: 9,
      nome: 'Uncharted 4',
      lancamento: '22/03/2005',
      category: 'game',
      price: 174,
      image: 'img/uncharted-4.jpg',
      quantity: 1,
    },
  ]);

}
