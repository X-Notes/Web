import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ThemeENUM } from '../../enums/theme.enum';

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

  themes = ThemeENUM;
}
