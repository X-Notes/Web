import { Injectable } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { Subject, Observable, BehaviorSubject, combineLatest, fromEvent } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { LockEncryptService } from 'src/app/content/notes/lock-encrypt.service';
import { TranslateService } from '@ngx-translate/core';
import { map, startWith, take } from 'rxjs/operators';
import { FolderStore } from 'src/app/content/folders/state/folders-state';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { Icons } from '../enums/icons.enum';
import { FontSizeENUM } from '../enums/font-size.enum';

export const timeSidenavAnimation = 200; // TODO move to constant file

export const sideBarCloseOpen = trigger('sidebarCloseOpen', [
  state('in', style({ transform: 'translateX(0)' })),
  transition(':enter', [style({ transform: 'translateX(-100%)' }), animate(`${timeSidenavAnimation}ms ease`)]),
  transition(':leave', [animate(`${timeSidenavAnimation}ms ease`, style({ transform: 'translateX(-100%)' }))]),
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

@Injectable({
  providedIn: 'root',
})
export class PersonalizationService {
  @Select(UserStore.getUserFontSize)
  public fontSize$: Observable<FontSizeENUM>;

  spinnerActive = false;

  timeForSpinnerLoading = 150;

  selectAllButton = new Subject();

  newButtonSubject = new Subject();

  manageNotesInFolderSubject = new Subject();

  stateSidebar = true;

  orientationMobile = false;

  hideInnerMenu = false;

  AnimationInnerMenu = true;

  AnimationInnerUsers = true;

  users = true;

  toggleHistory = false;

  isCollapseShared = false;

  changeOrientationSubject: Subject<boolean> = new Subject<boolean>();

  isMenuActive$: Observable<boolean> = new Observable<boolean>();

  isMobileHistoryActive$: Observable<boolean> = new Observable<boolean>();

  windowHeight$: BehaviorSubject<number> = new BehaviorSubject<number>(window.innerHeight);

  windowWidth$: BehaviorSubject<number> = new BehaviorSubject<number>(window.innerWidth);

  icon = Icons;

  constructor(
    public lockEncryptService: LockEncryptService,
    private translate: TranslateService,
    private store: Store,
  ) {
    this.onResize();
    this.subscribeActiveMenu();
    this.subscribeWindowEvents();
    this.subscribeMobileActiveMenu();
  }

  subscribeWindowEvents() {
    fromEvent(window, 'resize')
      .pipe(map((value) => value as any))
      .subscribe((evt) => {
        this.windowHeight$.next(evt.target.innerHeight);
        this.windowWidth$.next(evt.target.innerWidth);
      });
  }

  get isHistoryButtonInMobileMenu$() {
    return this.windowWidth$.pipe(map((value) => value < 1025));
  }

  get isHideTextOnSmall$() {
    return this.windowWidth$.pipe(map((value) => value < 1400));
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

  async getTranslateText(key) {
    return this.translate.get(key).pipe(take(1)).toPromise();
  }

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
    } else if (this.AnimationInnerMenu) {
      this.AnimationInnerMenu = false;
    }

    if (this.check()) {
      if (!this.isCollapseShared) {
        this.isCollapseShared = true;
      }
    } else if (this.isCollapseShared) {
      this.isCollapseShared = false;
    }

    if (this.checkWidth()) {
      if (this.users) {
        this.users = false;
        this.AnimationInnerUsers = false;
      }
    } else if (!this.users) {
      this.users = true;
      this.AnimationInnerUsers = true;
    }
  }

  setSpinnerState(flag: boolean) {
    this.spinnerActive = flag;
  }

  cancelSideBar() {
    this.stateSidebar = false;
  }

  async toggleHistoryMethod() {
    this.toggleHistory = !this.toggleHistory;
  }

  check = () => {
    return window.innerWidth > 1024;
  };

  checkWidth = () => {
    return !!(window.innerWidth > 1024 && window.innerWidth <= 1440);
  };

  isWidth600 = () => {
    return window.innerWidth >= 600;
  };

  waitPreloading() {
    return new Promise<boolean>((resolve) =>
      setTimeout(() => resolve(false), this.timeForSpinnerLoading),
    );
  }

  changeOrientation() {
    this.orientationMobile = !this.orientationMobile;
    this.changeOrientationSubject.next(true);
  }
}
