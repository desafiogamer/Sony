export interface productInterface {
  id: number;
  nome: string;
  lancamento: string;
  category: string;
  price: number;
  /** Preço original, usado para exibir o desconto. Opcional. */
  oldPrice?: number;
  image: string;
  /** Capa 460x613 usada nos cards; `image` fica para usos em tamanho cheio. */
  imageCard: string;
  quantity: number;
  rating: number;
  platform: string;
  tag?: string;
  descricao: string;
}

export interface cartItemInterface {
  product: productInterface;
  quantity: number;
}
