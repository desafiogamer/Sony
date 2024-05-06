import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-container-imgs',
  standalone: true,
  imports: [],
  templateUrl: './container-imgs.component.html',
  styleUrl: './container-imgs.component.css'
})
export class ContainerImgsComponent {
  @Input()src:string = '';
  @Input()alt:string = '';
}
