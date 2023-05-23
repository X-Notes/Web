import { Component, Input, Optional } from '@angular/core';

@Component({
  selector: 'app-toggle-text',
  templateUrl: './toggle-text.component.html',
  styleUrls: ['./toggle-text.component.scss'],
})
export class ToggleTextComponent {
  @Input()
  color?: string;
}
