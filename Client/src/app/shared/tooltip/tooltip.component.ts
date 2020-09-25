import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit } from '@angular/core';
import { tooltipAnimation } from 'src/app/shared/services/personalization.service';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  animations: [ tooltipAnimation ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent implements OnInit {
  
  @Input() public text = '';
  @HostBinding('@tooltip') anim = true;
  labelClass: boolean;
  labelColor: string;

  constructor() { }

  ngOnInit(): void {
  }

}
