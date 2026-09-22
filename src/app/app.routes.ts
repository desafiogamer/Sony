import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Sony Store — Exclusivos PlayStation',
    loadComponent: () =>
      import('./modules/Sony/pages/inicio/inicio.component').then(m => m.InicioComponent)
  },
  {
    path: 'products',
    title: 'Produtos — Sony Store',
    loadComponent: () =>
      import('./modules/Sony/pages/products/products.component').then(m => m.ProductsComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
