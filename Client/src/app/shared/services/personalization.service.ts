import { Injectable, HostListener } from '@angular/core';
import { Theme } from '../enums/Theme';
import { Language } from '../enums/Language';
import {
  trigger,
  state,
  style,
  transition,
  animate } from '@angular/animations';
import { Router, NavigationEnd } from '@angular/router';
import { take, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, AsyncSubject, Subject } from 'rxjs';

export const sideBarCloseOpen = trigger('sidebarCloseOpen', [
  state('in', style({ transform: 'translateX(0)' })),
  transition(':enter', [
    style({ transform: 'translateX(-100%)' }),
    animate('200ms ease')
  ]),
  transition(':leave', [
    animate('200ms ease', style({ transform: 'translateX(-100%)' }))
  ])
]);

export const changeColorLabel = trigger('changeColorLabel', [
  transition(':enter', [
    style({ opacity: 0, 'max-height': 0, transform: 'translateY(-30%)' }),
    animate('0.3s ease', style({ opacity: 1, 'max-height': '110px', height: '*', transform: 'translateY(0)'})),
  ]),
  transition(':leave', [
    animate('0.3s ease', style({ opacity: 0, height: 0, transform: 'translateY(-30%)' }))
  ])
]);


@Injectable({
  providedIn: 'root'
})
export class PersonalizationService {

  subject = new Subject();

  theme: Theme = Theme.Dark;
  language: Language = Language.RU;
  stateSidebar = true;
  orientationMobile = false;
  optionsScroll = { autoHide: true, scrollbarMinSize: 100 };
  grid;

  onResize(): void {
    if (this.check()) {
      if (this.stateSidebar === false) {
      this.stateSidebar = true;
      }
    } else {
      if (this.stateSidebar === true) {
        this.stateSidebar = false;
      }
    }
  }

  check(): boolean {
    return window.innerWidth > 1024 ? true : false;
  }

  constructor() {
   }
}
