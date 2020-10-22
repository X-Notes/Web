import * as Hammer from 'hammerjs';
import { HammerGestureConfig } from '@angular/platform-browser';
import { Injectable } from '@angular/core';

@Injectable()

export class MyHammerConfig extends HammerGestureConfig  {
  overrides = {
      swipe: { direction: Hammer.DIRECTION_ALL },
      tap: { direction: Hammer.DIRECTION_ALL },
      pinch: { enable: false },
      rotate: { enable: false }
  } as any;
}
