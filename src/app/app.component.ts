import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './components/header/header.component';
import { CartDrawerComponent } from './components/cart-drawer/cart-drawer.component';
import { ToastComponent } from './components/toast/toast.component';
import { Modelo3DComponent } from './components/modelo-3-d/modelo-3-d.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    RouterOutlet,
    CartDrawerComponent,
    ToastComponent,
    Modelo3DComponent
  ],

  template: `
    <!-- Fundo 3D (chuva + nuvens) -->
    @defer (on idle) {
      <app-modelo-3-d/>
    }

    <!-- Header fixo -->
    <app-header/>

    <!-- Conteúdo das rotas -->
    <main>
      <router-outlet/>
    </main>

    <!-- Carrinho lateral e notificações -->
    <app-cart-drawer/>
    <app-toast/>
  `,
  styles: [`
    main {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class AppComponent {}
