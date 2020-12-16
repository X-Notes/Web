import { Injectable } from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate } from '@angular/animations';
import {  Subject, Observable } from 'rxjs';
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

export const tooltipAnimation = trigger('tooltip', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate(300, style({ opacity: 1 })),
  ]),
  transition(':leave', [
    animate(150, style({ opacity: 0 })),
  ]),
]);

@Injectable({
  providedIn: 'root'
})

export class PersonalizationService {

  constructor() {}

  spinnerActive = false;
  timeForSpinnerLoading = 30;
  subject = new Subject();

  stateSidebar = true;
  orientationMobile = false;

  hideInnerMenu = false;
  AnimationInnerMenu = true;
  AnimationInnerUsers = true;
  users = true;
  toggleHistory = false;

  changeOrientationSubject: Subject<boolean> = new Subject<boolean>();


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

  setSpinnerState(flag: boolean) {
    this.spinnerActive = flag;
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

  waitPreloading() {
    return new Promise<boolean>((resolve, rej) => setTimeout(() => resolve(false), this.timeForSpinnerLoading));
  }

  changeOrientation() {
    this.orientationMobile = !this.orientationMobile;
    this.changeOrientationSubject.next(true);
  }

}
