import { Component } from '@angular/core';

//components
import { Modelo3DComponent } from '../../components/modelo-3-d/modelo-3-d.component';
import { HeaderComponent } from '../../components/header/header.component';
import { CardShopComponent } from '../../components/card-shop/card-shop.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    Modelo3DComponent,
    HeaderComponent,
    CardShopComponent
  ],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {

}
