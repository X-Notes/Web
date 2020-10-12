import { Injectable, HostListener } from '@angular/core';
import { Theme } from '../enums/Theme';
import { Language } from '../enums/Language';
import {
  trigger,
  state,
  style,
  transition,
  animate } from '@angular/animations';
import {  Subject, Observable } from 'rxjs';
import * as Muuri from 'muuri';
import { Select } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { FontSize } from '../enums/FontSize';

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

export const showMenuLeftRight = trigger('showMenuLeftRight', [
  transition(':enter', [
    style({ opacity: 0,  transform: 'translateX(-20%)' }),
    animate('0.3s ease', style({ opacity: 1, transform: 'translateY(0)'})),
  ]),
  transition(':leave', [
    animate('0.3s ease', style({ opacity: 0, transform: 'translateX(10%)' }))
  ])
]);

export const deleteSmallNote = trigger('deleteSmallNote', [
  transition(':leave', [
    animate('0.3s ease', style({ opacity: 0, height: '0', overflow: 'hidden'}))
  ])
]);

export const showHistory = trigger('showHistory', [
  transition(':enter', [
    style({ opacity: 0,  height: 0 }),
    animate('0.3s ease', style({ opacity: 1,  height: '*'})),
  ]),
  transition(':leave', [
    animate('0.3s ease', style({ opacity: 0, height: 0, overflow: 'hidden' }))
  ])
]);

@Injectable({
  providedIn: 'root'
})

export class PersonalizationService {

  constructor() {}

  subject = new Subject();

  stateSidebar = true;
  orientationMobile = false;
  optionsScroll = { autoHide: true, scrollbarMinSize: 100 };

  hideInnerMenu = false;
  AnimationInnerMenu = true;
  AnimationInnerUsers = true;
  users = true;
  toggleHistory = false;

  @Select(UserStore.getUserFontSize)
  public fontSize$: Observable<FontSize>;

  onResize(): void {
    if (this.check()) {
      if (!this.hideInnerMenu) {
        this.hideInnerMenu = true;
      }
      if (!this.stateSidebar) {
        this.stateSidebar = true;
      }
    } else {
      if (this.hideInnerMenu) {
        this.hideInnerMenu = false;
      }
      if (this.stateSidebar) {
          this.stateSidebar = false;
      }
    }

    if (this.check()) {
      if (!this.AnimationInnerMenu) {
        this.AnimationInnerMenu = true;
      }
    } else {
      if (this.AnimationInnerMenu) {
        this.AnimationInnerMenu = false;
      }
    }

    if (this.checkWidth()) {
      if (this.users) {
        this.users = false;
        this.AnimationInnerUsers = false;
      }
    } else {
      if (!this.users) {
        this.users = true;
        this.AnimationInnerUsers = true;
      }
    }
  }

  cancelSideBar() {
    this.stateSidebar = false;
  }

  toggleHistoryMethod() {
    this.toggleHistory = !this.toggleHistory;
  }

  check(): boolean {
    return window.innerWidth > 1024 ? true : false;
  }

  checkWidth(): boolean {
    return (window.innerWidth > 1024 && window.innerWidth < 1440) ? true : false;
  }
}
