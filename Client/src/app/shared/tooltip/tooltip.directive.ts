import { Overlay, OverlayConfig, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TooltipComponent } from './tooltip.component'

@Directive({
  selector: '[CustomTooltip]'
})
export class TooltipDirective implements OnInit {

  @Input('CustomTooltip') text = '';
  @Input('position') pos = '';
  @Input('flagDisable') disable = '';
  
  private overlayRef: OverlayRef;

  constructor(private overlay: Overlay,
              private overlayPositionBuilder: OverlayPositionBuilder,
              private elementRef: ElementRef) { }

  ngOnInit(): void {
    const config = new OverlayConfig({
      positionStrategy: this.positioning(),
    })

    this.overlayRef = this.overlay.create(config);
  }

  positioning() {
    switch(this.pos) {
      case 'Right': {
        const positionStrategyRight = this.overlayPositionBuilder
          .flexibleConnectedTo(this.elementRef)
          .withPositions([{
            originX: 'end',
            originY: 'center',
            overlayX: 'start',
            overlayY: 'center',
            offsetX: 11,
        }]);
        return positionStrategyRight;
      }
      case 'Bottom': {
        const positionStrategyBottom = this.overlayPositionBuilder
          .flexibleConnectedTo(this.elementRef)
          .withPositions([{
            originX: 'center',
            originY: 'bottom',
            overlayX: 'center',
            overlayY: 'top',
            offsetY: 11,
        }]);
        return positionStrategyBottom;
      }
      case 'Left': {
        const positionStrategyLeft = this.overlayPositionBuilder
          .flexibleConnectedTo(this.elementRef)
          .withPositions([{
            originX: 'start',
            originY: 'center',
            overlayX: 'end',
            overlayY: 'center',
            offsetX: -11,
        }]);
        return positionStrategyLeft;
      }
      default: {
        const positionStrategyTop = this.overlayPositionBuilder
          .flexibleConnectedTo(this.elementRef)
          .withPositions([{
            originX: 'center',
            originY: 'top',
            overlayX: 'center',
            overlayY: 'bottom',
            offsetY: -11,
        }]);
        return positionStrategyTop;
      }
    }
  }

  @HostListener('mouseenter')
  show() {
    if (this.disable === 'true') {
      return;
    }
    const tooltipRef: ComponentRef<TooltipComponent>
      = this.overlayRef.attach(new ComponentPortal(TooltipComponent));
    this.text = this.text.charAt(0).toUpperCase() + this.text.slice(1);
    tooltipRef.instance.text = this.text;
  }

  @HostListener('mouseleave')
  hide() {
    this.overlayRef.detach();
  }

}
