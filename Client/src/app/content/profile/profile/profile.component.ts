import { Component, OnInit, ViewChild, ElementRef, OnDestroy, Renderer2 } from '@angular/core';
import { PersonalizationService, sideBarCloseOpen, showDropdown } from 'src/app/shared/services/personalization.service';
import { Select, Store } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Observable, Subject } from 'rxjs';
import { LanguageDTO } from 'src/app/shared/models/LanguageDTO';
import {
  ChangeLanguage, ChangeFontSize, ChangeTheme,
  UpdateUserName, UpdateUserPhoto, SetDefaultBackground
} from 'src/app/core/stateUser/user-action';
import { FontSize } from 'src/app/shared/models/FontSize';
import { ShortUser } from 'src/app/core/models/short-user';
import { AuthService } from 'src/app/core/auth.service';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { takeUntil } from 'rxjs/operators';
import { Background } from 'src/app/core/models/background';
import { BackgroundStore } from 'src/app/core/backgrounds/background-state';
import { LoadBackgrounds, NewBackground, RemoveBackground, SetBackground } from 'src/app/core/backgrounds/background-action';
import { AppStore } from 'src/app/core/stateApp/app-state';
import {CdkConnectedOverlay, ConnectionPositionPair} from '@angular/cdk/overlay';
import { ThemeENUM } from 'src/app/shared/enums/ThemeEnum';
import { FontSizeENUM } from 'src/app/shared/enums/FontSizeEnum';
import { Theme } from 'src/app/shared/models/Theme';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [sideBarCloseOpen, showDropdown]
})
export class ProfileComponent implements OnInit, OnDestroy {

  fontSize = FontSizeENUM;

  @Select(UserStore.getUserFontSize)
  public fontSize$: Observable<FontSize>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  @Select(UserStore.getUserBackground)
  public userBackground$: Observable<ShortUser>;

  @Select(UserStore.getUserLanguage)
  public language$: Observable<LanguageDTO>;

  @Select(BackgroundStore.getUserBackgrounds)
  public backgrounds$: Observable<Background[]>;

  @ViewChild('uploadFile') uploadPhoto: ElementRef;
  @ViewChild(CdkConnectedOverlay) cdkConnectedOverlay: CdkConnectedOverlay;

  userName;

  @Select(AppStore.getLanguages)
  languages$: Observable<LanguageDTO[]>;

  public photoError = false;
  destroy = new Subject<void>();
  isOpen = false;

  public positions = [
      new ConnectionPositionPair({
          originX: 'end',
          originY: 'bottom'},
          {overlayX: 'end',
          overlayY: 'top'},
          0,
          1)
  ];

  constructor(public pService: PersonalizationService,
              private store: Store,
              private rend: Renderer2,
              private authService: AuthService) { }

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.Profile)).toPromise();
    this.pService.onResize();
    this.userName = this.store.selectSnapshot(UserStore.getUser).name;

    this.store.select(AppStore.appLoaded)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (x: boolean) => {
        if (x) {
          this.store.dispatch(new LoadBackgrounds());
        }
      }
      );

    this.pService.subject
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.newBackground());
  }

  setLanguage(item: LanguageDTO): void {
    this.store.dispatch(new ChangeLanguage(item));
    this.isOpen = false;
    setTimeout( () => {
      this.cdkConnectedOverlay.overlayRef.updatePosition();
    }, 100);
  }

  closeDropdown() {
    this.isOpen = false;
  }

  setCurrent(id: string) {
    this.store.dispatch(new SetBackground(id));
  }

  removeBackground(id: string) {
    this.store.dispatch(new RemoveBackground(id));
    const user = this.store.selectSnapshot(UserStore.getUser);
    if (id === user.currentBackground.id)
    {
      this.store.dispatch(new SetDefaultBackground());
    }
  }

  cancelSideBar() {
    this.pService.stateSidebar = false;
  }

  logout() {
    this.authService.logout();
  }

  updateName() {
    const oldName = this.store.selectSnapshot(UserStore.getUser).name;
    if (oldName !== this.userName) {
      this.store.dispatch(new UpdateUserName(this.userName));
    }
  }

  changeTheme(value: boolean) {
    const themes = this.store.selectSnapshot(AppStore.getThemes);
    if (value) {
      const whiteTheme = themes.find(x => x.name === ThemeENUM.Light);
      this.store.dispatch(new ChangeTheme(whiteTheme));
    } else {
      const darkTheme = themes.find(x => x.name === ThemeENUM.Dark);
      this.store.dispatch(new ChangeTheme(darkTheme));
    }
  }

  changeFontSize(value: boolean) {
    const fontSizes = this.store.selectSnapshot(AppStore.getFontSizes);
    if (value) {
      const bigSize = fontSizes.find(x => x.name === FontSizeENUM.Big);
      this.store.dispatch(new ChangeFontSize(bigSize));
    } else {
      const mediumSize = fontSizes.find(x => x.name === FontSizeENUM.Medium);
      this.store.dispatch(new ChangeFontSize(mediumSize));
    }
  }

  newBackground() {
    this.uploadPhoto.nativeElement.click();
  }

  uploadImage(event) {
    const file = event.target.files[0];
    if (file) {
      const formDate = new FormData();
      formDate.append('photo', file);
      this.store.dispatch(new NewBackground(formDate));
    }
  }

  uploadImageUserPhoto(event) {
    const file = event.target.files[0];
    if (file) {
      const formDate = new FormData();
      formDate.append('photo', file);
      this.store.dispatch(new UpdateUserPhoto(formDate));
    }
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  changeSource(event) {
    this.photoError = true;
  }
}
