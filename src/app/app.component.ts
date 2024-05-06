import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { CardShopComponent } from './components/card-shop/card-shop.component';
import { Modelo3DComponent } from './components/modelo-3-d/modelo-3-d.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    RouterOutlet,
    CardShopComponent,
    Modelo3DComponent,
  ],

  template: `
    <!--Header-->
    <app-header/>

    <!--Carrinho de compra-->
    <app-card-shop/>

    <!--modelo 3D-->
    <app-modelo-3-d/>

    <!--Rotas-->
    <router-outlet/>
  `
})
export class AppComponent {

}
