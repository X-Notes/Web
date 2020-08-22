import * as Hammer from 'hammerjs';
import { HammerGestureConfig } from '@angular/platform-browser';

export class MyHammerConfig extends HammerGestureConfig  {
  overrides = {
      swipe: { direction: Hammer.DIRECTION_ALL },
      tap: { direction: Hammer.DIRECTION_ALL },
      pinch: { enable: false },
      rotate: { enable: false }
  } as any;
}
