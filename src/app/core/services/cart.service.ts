import { Injectable, computed, effect, signal } from '@angular/core';
import { cartItemInterface, productInterface } from '../../modules/Sony/interfaces/products.interface';

const STORAGE_KEY = 'sony-store-cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<cartItemInterface[]>(this.restore());
  private readonly _open = signal(false);

  public readonly items = this._items.asReadonly();
  public readonly isOpen = this._open.asReadonly();

  public readonly count = computed(() =>
    this._items().reduce((total, item) => total + item.quantity, 0)
  );

  public readonly subtotal = computed(() =>
    this._items().reduce((total, item) => total + item.product.price * item.quantity, 0)
  );

  public readonly savings = computed(() =>
    this._items().reduce((total, item) => {
      const old = item.product.oldPrice ?? item.product.price;
      return total + (old - item.product.price) * item.quantity;
    }, 0)
  );

  constructor() {
    effect(() => this.persist(this._items()));
  }

  public add(product: productInterface, quantity = 1): void {
    this._items.update(items => {
      const existing = items.find(item => item.product.id === product.id);

      if (existing) {
        return items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...items, { product, quantity }];
    });
  }

  public remove(productId: number): void {
    this._items.update(items => items.filter(item => item.product.id !== productId));
  }

  public setQuantity(productId: number, quantity: number): void {
    if (quantity < 1) {
      this.remove(productId);
      return;
    }

    this._items.update(items =>
      items.map(item => (item.product.id === productId ? { ...item, quantity } : item))
    );
  }

  public increment(productId: number): void {
    const item = this._items().find(entry => entry.product.id === productId);
    if (item) this.setQuantity(productId, item.quantity + 1);
  }

  public decrement(productId: number): void {
    const item = this._items().find(entry => entry.product.id === productId);
    if (item) this.setQuantity(productId, item.quantity - 1);
  }

  public clear(): void {
    this._items.set([]);
  }

  public has(productId: number): boolean {
    return this._items().some(item => item.product.id === productId);
  }

  public open(): void {
    this._open.set(true);
  }

  public close(): void {
    this._open.set(false);
  }

  public toggle(): void {
    this._open.update(open => !open);
  }

  private persist(items: cartItemInterface[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Armazenamento indisponível (modo privado, cota cheia): carrinho segue só em memória.
    }
  }

  private restore(): cartItemInterface[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
