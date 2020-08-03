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
import * as Muuri from 'muuri';

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

  constructor() {}

  subject = new Subject();

  theme: Theme = Theme.Dark;
  language: Language = Language.RU;
  stateSidebar = true;
  orientationMobile = false;
  optionsScroll = { autoHide: true, scrollbarMinSize: 100 };
  grid;
  helpIcons = true;

  onResize(): void {
    if (this.check()) {
      if (this.stateSidebar === false) {
        this.stateSidebar = true;
        this.helpIcons = true;
      }
    } else {
      if (this.stateSidebar === true) {
          this.stateSidebar = false;
          this.helpIcons = false;
      }
    }
  }

  cancelSideBar() {
    this.stateSidebar = false;
  }

  check(): boolean {
    return window.innerWidth > 1024 ? true : false;
  }

  gridSettings() {
    const dragHelper = document.querySelector('.drag-helper') as HTMLElement;

    this.grid = new Muuri.default('.grid', {
      items: '.grid-item',
      dragEnabled: true,
      layout: {
        fillGaps: false,
        horizontal: false,
        alignRight: false,
        alignBottom: false,
        rounding: true
      },
      dragContainer: dragHelper,
      dragRelease: {
        useDragContainer: false
      },
      dragCssProps: {
        touchAction: 'auto'
      },
      dragStartPredicate(item, e) {
        if ( e.deltaTime > 300) {
          if ((e.type === 'move' || e.type === 'start')) {
            item.getGrid()
            .getItems()
            .forEach(
              elem => elem.getElement().style.touchAction = 'none');
            console.log(item.getGrid().getItems().indexOf(item));
            return true;
          } else if (e.type === 'end' || e.type === 'cancel') {
            item.getGrid()
            .getItems()
            .forEach(
              elem => elem.getElement().style.touchAction = 'auto');
            return true;
          }
        }
      },
      dragPlaceholder: {
        enabled: true,
        createElement(item: any) {
          return item.getElement().cloneNode(true);
        }
      },
      dragAutoScroll: {
        targets: [
          { element: window, priority: -1 },
          { element: document.querySelector('.content-inner .simplebar-content-wrapper') as HTMLElement, priority: 1, axis: 2 },
        ],
        sortDuringScroll: false,
        smoothStop: true,
        safeZone: 0.1
      }
    });
  }
}
