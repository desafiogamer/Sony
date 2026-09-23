import { Injectable, signal } from '@angular/core';
import { productInterface } from '../../modules/Sony/interfaces/products.interface';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly _products = signal<productInterface[]>([
    {
      id: 1,
      nome: "Marvel's Spider-Man 2",
      lancamento: '20/10/2023',
      category: 'Ação',
      price: 249.9,
      oldPrice: 349.9,
      image: 'assets/img/spider2.webp',
      imageCard: 'assets/img/cards/spider2.webp',
      quantity: 1,
      rating: 4.9,
      platform: 'PS5',
      tag: 'Mais vendido',
      descricao: 'Peter e Miles enfrentam a ameaça definitiva de Venom em Nova York.'
    },
    {
      id: 2,
      nome: 'Horizon Forbidden West',
      lancamento: '18/02/2022',
      category: 'RPG',
      price: 97.9,
      oldPrice: 199.9,
      image: 'assets/img/forbidden.webp',
      imageCard: 'assets/img/cards/forbidden.webp',
      quantity: 1,
      rating: 4.7,
      platform: 'PS5 · PS4',
      tag: 'Oferta',
      descricao: 'Aloy explora fronteiras perigosas em busca da origem de uma praga misteriosa.'
    },
    {
      id: 3,
      nome: 'The Last of Us Part II',
      lancamento: '19/06/2020',
      category: 'Ação',
      price: 193.9,
      image: 'assets/img/the-last-of-us.webp',
      imageCard: 'assets/img/cards/the-last-of-us.webp',
      quantity: 1,
      rating: 4.8,
      platform: 'PS5 · PS4',
      descricao: 'Uma jornada brutal sobre vingança, perda e as escolhas que nos definem.'
    },
    {
      id: 4,
      nome: 'Ghost of Tsushima',
      lancamento: '17/07/2020',
      category: 'Aventura',
      price: 195.9,
      oldPrice: 249.9,
      image: 'assets/img/ghost-of-tsushima.webp',
      imageCard: 'assets/img/cards/ghost-of-tsushima.webp',
      quantity: 1,
      rating: 4.9,
      platform: 'PS5 · PS4',
      tag: 'Diretor',
      descricao: 'Torne-se o Fantasma e liberte Tsushima da invasão mongol.'
    },
    {
      id: 5,
      nome: 'God of War',
      lancamento: '20/04/2018',
      category: 'Ação',
      price: 99.9,
      oldPrice: 149.9,
      image: 'assets/img/godofwar.webp',
      imageCard: 'assets/img/cards/godofwar.webp',
      quantity: 1,
      rating: 4.9,
      platform: 'PS4',
      tag: 'Clássico',
      descricao: 'Kratos e Atreus atravessam os nove reinos nórdicos numa jornada de pai e filho.'
    },
    {
      id: 6,
      nome: 'God of War Ragnarök',
      lancamento: '09/11/2022',
      category: 'Ação',
      price: 349.9,
      image: 'assets/img/godrag.webp',
      imageCard: 'assets/img/cards/godrag.webp',
      quantity: 1,
      rating: 5,
      platform: 'PS5 · PS4',
      tag: 'Lançamento',
      descricao: 'O fim de todas as coisas se aproxima. Enfrente o destino ao lado de Kratos.'
    },
    {
      id: 7,
      nome: 'Death Stranding',
      lancamento: '08/11/2019',
      category: 'Aventura',
      price: 94.9,
      oldPrice: 179.9,
      image: 'assets/img/death-stranding.webp',
      imageCard: 'assets/img/cards/death-stranding.webp',
      quantity: 1,
      rating: 4.5,
      platform: 'PS5 · PS4',
      tag: 'Oferta',
      descricao: 'Reconecte um mundo fragmentado na obra mais ousada de Hideo Kojima.'
    },
    {
      id: 8,
      nome: "Marvel's Spider-Man Remastered",
      lancamento: '12/11/2020',
      category: 'Aventura',
      price: 149.9,
      image: 'assets/img/spiderinicio.webp',
      imageCard: 'assets/img/cards/spiderinicio.webp',
      quantity: 1,
      rating: 4.8,
      platform: 'PS5',
      descricao: 'Balance por Nova York com gráficos remasterizados e ray tracing.'
    }
  ]);

  /** Lista de produtos somente leitura. */
  public readonly products = this._products.asReadonly();

  public getById(id: number): productInterface | undefined {
    return this._products().find(product => product.id === id);
  }
}
