import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { TextBackgroundColors } from 'src/app/shared/enums/text-background-colors.enum';
import { TextColors } from 'src/app/shared/enums/text-colors.enum';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';

@Component({
  selector: 'app-color-pick-item',
  templateUrl: './color-pick-item.component.html',
  styleUrls: ['./color-pick-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorPickItemComponent implements OnInit {
  @Output()
  pickColor = new EventEmitter();

  @Input()
  name: string;

  @Input()
  color: string;

  @Input()
  isBackground: boolean;

  @Input()
  theme: ThemeENUM;

  hoverText = false;

  @HostListener('mouseenter') onMouseEnter() {
    this.hoverText = true;
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.hoverText = false;
  }

  ngOnInit(): void {}

  getColor(color: string): string {
    if (color === TextBackgroundColors.Default && this.theme === ThemeENUM.Light) {
      return '#f2f2f2';
    }
    return color;
  }

  getColorText(color: string): string {
    if (color === TextBackgroundColors.Default) {
      return null;
    }
    return color;
  }

  getTextColor(color: TextColors): string {
    if (!this.hoverText) {
      return 'initial';
    }
    if (color === TextColors.Default && this.theme === ThemeENUM.Light) {
      return 'black';
    }
    return color;
  }

  setColor($event: MouseEvent): void {
    $event.preventDefault();
    this.pickColor.emit();
  }
}
