import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-container-imgs',
  standalone: true,
  imports: [],
  templateUrl: './container-imgs.component.html',
  styleUrl: './container-imgs.component.css'
})
export class ContainerImgsComponent {
  @Input() src = '';
  @Input() alt = '';

  /** Dimensoes reais do arquivo: reservam o espaco antes do download. */
  @Input() width = 350;
  @Input() height = 603;
}
