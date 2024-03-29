import { Injectable } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes, query } from '@angular/animations';
import { Subject, Observable, BehaviorSubject, combineLatest, fromEvent } from 'rxjs';
import { Store } from '@ngxs/store';
import { map, startWith } from 'rxjs/operators';
import { FolderStore } from 'src/app/content/folders/state/folders-state';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { Icons } from '../enums/icons.enum';
import { audioControlsId, sideBarId } from 'src/app/core/defaults/component-sizes';

export const timeSidenavAnimation = 200; // TODO move to constant file

export const sideBarCloseOpen = trigger('sidebarCloseOpen', [
  state('in', style({ transform: 'translateX(0)' })),
  transition(':enter', [
    style({ transform: 'translateX(-100%)' }),
    animate(`${timeSidenavAnimation}ms ease`),
  ]),
  transition(':leave', [
    animate(`${timeSidenavAnimation}ms ease`, style({ transform: 'translateX(-100%)' })),
  ]),
]);

export const changeColorLabel = trigger('changeColorLabel', [
  transition(':enter', [
    style({ opacity: 0, 'max-height': 0, transform: 'translateY(-30%)' }),
    animate(
      '0.3s ease',
      style({ opacity: 1, 'max-height': '110px', height: '*', transform: 'translateY(0)' }),
    ),
  ]),
  transition(':leave', [
    animate('0.3s ease', style({ opacity: 0, height: 0, transform: 'translateY(-30%)' })),
  ]),
]);

export const showMenuLeftRight = trigger('showMenuLeftRight', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(-20%)' }),
    animate('0.3s ease', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
  transition(':leave', [animate('0.3s ease', style({ opacity: 0, transform: 'translateX(10%)' }))]),
]);

export const deleteSmallNote = trigger('deleteSmallNote', [
  transition(':leave', [
    animate('0.3s ease', style({ opacity: 0, height: '0', overflow: 'hidden' })),
  ]),
]);

export const showHistory = trigger('showHistory', [
  transition(':enter', [
    style({ opacity: 0, height: 0 }),
    animate('0.3s ease', style({ opacity: 1, height: '*' })),
  ]),
  transition(':leave', [
    animate('0.3s ease', style({ opacity: 0, height: 0, overflow: 'hidden' })),
  ]),
]);

export const collapse = trigger('collapse', [
  transition(':enter', [
    style({ height: 0, margin: 0, overflow: 'hidden' }),
    animate('0.3s ease', style({ height: '*', margin: '*' })),
  ]),
  transition(':leave', [animate('0.3s ease', style({ height: 0, margin: 0, overflow: 'hidden' }))]),
]);

export const showDropdown = trigger('showDropdown', [
  state(
    'void',
    style({
      transform: 'scaleY(0.8)',
      opacity: 0,
    }),
  ),
  state(
    'showing',
    style({
      opacity: 1,
      transform: 'scaleY(1)',
    }),
  ),
  transition('void => *', animate('120ms cubic-bezier(0, 0, 0.2, 1)')),
  transition('* => void', animate('100ms 25ms linear', style({ opacity: 0 }))),
]);

export const tooltipAnimation = trigger('tooltip', [
  transition(':enter', [style({ opacity: 0 }), animate(300, style({ opacity: 1 }))]),
  transition(':leave', [animate(150, style({ opacity: 0 }))]),
]);

export const smoothOpacity = (time = 100) =>
  trigger('smoothOpacity', [
    transition(':enter', [style({ opacity: 0 }), animate(time, style({ opacity: 1 }))]),
  ]);

export const notification = trigger('notification', [
  transition(':enter', [style({ opacity: 0 }), animate(100, style({ opacity: 1 }))]),
  transition(':leave', [animate(100, style({ opacity: 0 }))]),
]);

export const photoInit = trigger('photoInit', [
  state('noLoaded', style({ opacity: 0 })),
  transition('* => loaded', [animate('0.3s ease-out')]),
]);

export const shake = trigger('shake', [
  transition(
    ':enter',
    animate(
      '800ms ease',
      keyframes([
        style({ transform: 'translate3d(-1px, 0, 0)', offset: 0.1 }),
        style({ transform: 'translate3d(2px, 0, 0)', offset: 0.2 }),
        style({ transform: 'translate3d(-2px, 0, 0)', offset: 0.3 }),
        style({ transform: 'translate3d(2px, 0, 0)', offset: 0.4 }),
        style({ transform: 'translate3d(-2px, 0, 0)', offset: 0.7 }),
        style({ transform: 'translate3d(2px, 0, 0)', offset: 0.8 }),
        style({ transform: 'translate3d(-1px, 0, 0)', offset: 0.9 }),
      ]),
    ),
  ),
]);

export const uploader = trigger('uploader', [
  transition(':leave', [
    query('.message-header, .operations-container', [style({ opacity: 0 })]),
    animate('0.2s ease-out', style({ width: 0 })),
  ]),
  transition(':enter', [
    query('.message-header, .operations-container', [style({ opacity: 0 })]),
    style({ width: 0 }),
    animate('0.1s ease-out', style({ width: '*' })),
  ]),
]);

@Injectable()
export class PersonalizationService {

  spinnerActive = false;

  startMobileWidth = 1025;

  timeForSpinnerLoading = 100;

  selectAllButton = new Subject();

  newButtonSubject = new Subject();

  emptyTrashButtonSubject = new Subject();

  addNotesToFolderSubject = new Subject();

  removeNotesToFolderSubject = new Subject();

  sideBarActive$ = new BehaviorSubject<boolean>(false);

  innerNoteMenuActive = false;

  changeNotesViewSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  isMenuActive$: Observable<boolean> = new Observable<boolean>();

  isDisableRightToolsActive$: Observable<boolean> = new Observable<boolean>();

  isMobileHistoryActive$: Observable<boolean> = new Observable<boolean>();

  windowHeight$: BehaviorSubject<number> = new BehaviorSubject<number>(window.innerHeight);

  windowWidth$: BehaviorSubject<number> = new BehaviorSubject<number>(window.innerWidth);

  isInnerFolderSelectAllActive$ = new BehaviorSubject<boolean>(false);

  icon = Icons;

  isSnackBarActive$ = new BehaviorSubject<boolean>(false);

  isDialogActive$ = new BehaviorSubject<boolean>(false);

  constructor(private store: Store) {
    this.subscribeActiveMenu();
    this.subscribeWindowEvents();
    this.subscribeMobileActiveMenu();
    this.subscribeDisableRightsTools();
    this.initNotesView();
  }

  get isActiveFullNoteMobileButtons$() {
    return this.windowWidth$.pipe(map((value) => value < this.startMobileWidth));
  }

  get isHistoryButtonInMobileMenu$() {
    return this.windowWidth$.pipe(map((value) => value < this.startMobileWidth));
  }

  get isHideTextOnSmall$() {
    return this.windowWidth$.pipe(map((value) => value < 1380));
  }

  get widthMoreThan1024$() {
    return this.windowWidth$.pipe(map((value) => value > 1024));
  }

  get isWidthMoreThan600$() {
    return this.windowWidth$.pipe(map((value) => value >= 600));
  }

  get navMenuHeight(): number {
    const height = document.getElementById(sideBarId)?.offsetHeight;
    return height ?? 0;
  }

  get audioControlsHeight(): number {
    const height = document.getElementById(audioControlsId)?.offsetHeight;
    return height ?? 0;
  }

  subscribeWindowEvents() {
    fromEvent(window, 'resize')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .pipe(map((value) => value as any))
      .subscribe((evt) => {
        this.windowHeight$.next(evt.target.innerHeight);
        this.windowWidth$.next(evt.target.innerWidth);
      });
  }

  subscribeMobileActiveMenu() {
    this.isMobileHistoryActive$ = combineLatest([
      this.store.select(AppStore.isNoteInner).pipe(startWith(false)),
      this.isHistoryButtonInMobileMenu$.pipe(startWith(false)),
    ]).pipe(map(([n, f]) => n && f));
  }

  subscribeActiveMenu() {
    this.isMenuActive$ = combineLatest([
      this.store.select(NoteStore.activeMenu).pipe(startWith(false)),
      this.store.select(FolderStore.activeMenu).pipe(startWith(false)),
    ]).pipe(map(([n, f]) => n || f));
  }

  subscribeDisableRightsTools() {
    this.isDisableRightToolsActive$ = combineLatest([
      this.windowWidth$.pipe(map((value) => value < 1180)).pipe(startWith(false)),
      this.isMenuActive$.pipe(startWith(false)),
    ]).pipe(map(([n, f]) => n && f));
  }

  setSpinnerState(flag: boolean) {
    this.spinnerActive = flag;
  }

  cancelSideBar() {
    this.sideBarActive$.next(false);
  }

  isMobile(): boolean {
    return window.innerWidth < this.startMobileWidth;
  }

  waitPreloading(time?: number) {
    return new Promise<boolean>((resolve) =>
      setTimeout(() => resolve(false), time ?? this.timeForSpinnerLoading),
    );
  }

  initNotesView(): void {
    const key = 'notes-view';
    const item = localStorage.getItem(key);
    const isCardView = item === 'card' ? true : false;
    this.changeNotesViewSubject$.next(isCardView);
  }

  changeNotesView() {
    const key = 'notes-view';
    const card = 'card';
    const normal = 'normal';
    const item = localStorage.getItem(key);
    if (item === card) {
      localStorage.setItem(key, normal);
      this.changeNotesViewSubject$.next(false);
    }
    if (!item || item === normal) {
      localStorage.setItem(key, card);
      this.changeNotesViewSubject$.next(true);
    }
  }
}
