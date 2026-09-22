import { Injectable, signal } from '@angular/core';

export interface toastInterface {
  id: number;
  titulo: string;
  mensagem: string;
  image?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly _toasts = signal<toastInterface[]>([]);

  public readonly toasts = this._toasts.asReadonly();

  public show(titulo: string, mensagem: string, image?: string): void {
    const id = this.nextId++;
    this._toasts.update(toasts => [...toasts, { id, titulo, mensagem, image }]);
    setTimeout(() => this.dismiss(id), 3200);
  }

  public dismiss(id: number): void {
    this._toasts.update(toasts => toasts.filter(toast => toast.id !== id));
  }
}
