import { Injectable, HostListener } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Theme } from '../enums/Theme';
import { Language } from '../enums/Language';
import {
  trigger,
  state,
  style,
  transition,
  animate } from '@angular/animations';

export const sideBarCloseOpen = trigger('sidebarCloseOpen', [
  state('in', style({ transform: 'translateX(0)' })),
  transition('void => *', [
    style({ transform: 'translateX(-100%)' }),
    animate('200ms ease')
  ]),
  transition('* => void', [
    animate('200ms ease', style({ transform: 'translateX(-100%)' }))
  ])
]);


@Injectable({
  providedIn: 'root'
})
export class PersonalizationService {

  theme: Theme = Theme.Dark;
  language: Language = Language.EN;
  stateSidebar = true;

  @HostListener('window:resize') onResize(): boolean {
    return window.innerWidth > 768 ? true : false;
  }

  constructor() { }
}
