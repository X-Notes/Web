import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { tooltipAnimation } from 'src/app/shared/services/personalization.service';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  animations: [tooltipAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent {
  @Input() public text = '';

  @HostBinding('@tooltip') anim = true;

  labelClass = false;

  labelColor?: string;
}
