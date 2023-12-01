import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  PersonalizationService,
  showMenuLeftRight,
  notification,
} from 'src/app/shared/services/personalization.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Select, Store } from '@ngxs/store';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { ShortUser } from 'src/app/core/models/user/short-user.model';
import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { LoadNotifications } from 'src/app/core/stateApp/app-action';
import { LabelStore } from '../../labels/state/labels-state';
import { MenuButtonsService } from '../services/menu-buttons.service';
import { PermissionsButtonsService } from '../services/permissions-buttons.service';
import { AppInitializerService } from 'src/app/core/app-initializer.service';
import { GeneralButtonStyleType } from '../header-components/general-header-button/models/general-button-style-type.enum';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { NavigatorService } from 'src/app/core/navigator.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [showMenuLeftRight, notification],
})
export class HeaderComponent implements OnInit, OnDestroy {
  // Upper Menu

  @Select(AppStore.getNotificationsCount)
  public notificationCount$: Observable<number>;

  @Select(AppStore.getName)
  public route$: Observable<string>;

  @Select(AppStore.isProfile)
  public isProfile$: Observable<boolean>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<ThemeENUM>;

  @Select(AppStore.getMenuSwitch)
  public menuSwitch$: Observable<string>;

  @Select(AppStore.isNoteInner)
  public isNoteInner$: Observable<boolean>;

  @Select(AppStore.isFolderInner)
  public isFolderInner$: Observable<boolean>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @Select(LabelStore.countDeleted)
  countDeleted$: Observable<number>;

  destroy = new Subject<void>();

  isOpenNotification = false;

  public photoError = false;

  buttonStyleType = GeneralButtonStyleType;

  public positions = [
    new ConnectionPositionPair(
      {
        originX: 'start',
        originY: 'top',
      },
      { overlayX: 'start', overlayY: 'top' },
      0,
      1,
    ),
  ];

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    public menuButtonService: MenuButtonsService,
    public pB: PermissionsButtonsService,
    private appInitializerService: AppInitializerService,
    private navigationService: NavigatorService,
  ) { }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.store
      .select(UserStore.getUser)
      .pipe(takeUntil(this.destroy))
      .subscribe(() => {
        this.photoError = false;
      });

    this.store.dispatch(LoadNotifications);
    this.appInitializerService.init();
  }

  closeNotification() {
    this.isOpenNotification = false;
  }

  changeSource() {
    this.photoError = true;
  }

  openSidebar() {
    this.pService.sideBarActive$.next(true);
  }

  newButton() {
    this.pService.newButtonSubject.next(true);
  }

  deleteAllFromBin() {
    this.pService.emptyTrashButtonSubject.next(true);
  }
}
