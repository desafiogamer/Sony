import { Component } from '@angular/core';

//components
import { LinhasComponent } from '../../components/linhas/linhas.component';
import { ContainerImgsComponent } from '../../components/container-imgs/container-imgs.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    LinhasComponent,
    ContainerImgsComponent,
  ],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  public src:string = 'assets/img/godofwar.webp'
  public alt:string = 'God of War'
}
