import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-chip',
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],
})
export class ChipComponent {
  @Input() text: string;

  @Input() dark: boolean;

  @Input() color: string;

  @Input() tile: boolean;

  @Input() isRemovable: boolean;

  @Output() remove = new EventEmitter<void>();
}
