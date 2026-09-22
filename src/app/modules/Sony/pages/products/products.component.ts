import { Component, computed, inject, signal } from '@angular/core';

//components
import { ProductCardComponent } from '../../components/product-card/product-card.component';

//services
import { ProductsService } from '../../../../core/services/products.service';

type ordenacao = 'destaque' | 'menor' | 'maior' | 'nota' | 'nome';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ProductCardComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  private readonly productsService = inject(ProductsService);

  public readonly busca = signal('');
  public readonly categoriaAtiva = signal('Todos');
  public readonly ordem = signal<ordenacao>('destaque');

  public readonly categorias = computed(() => [
    'Todos',
    ...new Set(this.productsService.products().map(product => product.category))
  ]);

  public readonly produtosFiltrados = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    const categoria = this.categoriaAtiva();

    const filtrados = this.productsService.products().filter(product => {
      const casaCategoria = categoria === 'Todos' || product.category === categoria;
      const casaBusca =
        !termo ||
        product.nome.toLowerCase().includes(termo) ||
        product.category.toLowerCase().includes(termo);

      return casaCategoria && casaBusca;
    });

    switch (this.ordem()) {
      case 'menor':
        return [...filtrados].sort((a, b) => a.price - b.price);
      case 'maior':
        return [...filtrados].sort((a, b) => b.price - a.price);
      case 'nota':
        return [...filtrados].sort((a, b) => b.rating - a.rating);
      case 'nome':
        return [...filtrados].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      default:
        return filtrados;
    }
  });

  public setCategoria(categoria: string): void {
    this.categoriaAtiva.set(categoria);
  }

  public onBusca(event: Event): void {
    this.busca.set((event.target as HTMLInputElement).value);
  }

  public onOrdem(event: Event): void {
    this.ordem.set((event.target as HTMLSelectElement).value as ordenacao);
  }

  public limparFiltros(): void {
    this.busca.set('');
    this.categoriaAtiva.set('Todos');
    this.ordem.set('destaque');
  }
}
