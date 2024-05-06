import { Routes } from '@angular/router';

//pages
import { InicioComponent } from './modules/Sony/pages/inicio/inicio.component';
import { ProductsComponent } from './modules/Sony/pages/products/products.component';


export const routes: Routes = [
  {
    path:'',
    component: InicioComponent
  },
  {
    path: 'products',
    component: ProductsComponent
  }
];
