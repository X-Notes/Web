import { Component, OnInit, ViewChild, ElementRef, OnDestroy, Renderer2 } from '@angular/core';
import {
  PersonalizationService,
  sideBarCloseOpen,
  showDropdown,
} from 'src/app/shared/services/personalization.service';
import { Select, Store } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Observable, Subject } from 'rxjs';
import {
  ChangeLanguage,
  ChangeFontSize,
  ChangeTheme,
  UpdateUserName,
  UpdateUserPhoto,
  SetDefaultBackground,
  UpdatePersonalization,
} from 'src/app/core/stateUser/user-action';
import { ShortUser } from 'src/app/core/models/short-user.model';
import { AuthService } from 'src/app/core/auth.service';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { takeUntil } from 'rxjs/operators';
import { Background } from 'src/app/core/models/background.model';
import { BackgroundStore } from 'src/app/core/backgrounds/background-state';
import {
  LoadBackgrounds,
  NewBackground,
  RemoveBackground,
  SetBackground,
} from 'src/app/core/backgrounds/background-action';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { FontSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { hideForDemo } from 'src/environments/demo';
import { LanguagesENUM } from 'src/app/shared/enums/languages.enum';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [sideBarCloseOpen, showDropdown],
})
export class ProfileComponent implements OnInit, OnDestroy {
  @Select(UserStore.getUserFontSize)
  public fontSize$: Observable<FontSizeENUM>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<ThemeENUM>;

  @Select(UserStore.getUserBackground)
  public userBackground$: Observable<string>;

  @Select(UserStore.getUserLanguage)
  public language$: Observable<LanguagesENUM>;

  @Select(BackgroundStore.getUserBackgrounds)
  public backgrounds$: Observable<Background[]>;

  @ViewChild('uploadFile') uploadPhoto: ElementRef;

  hideFor = hideForDemo;

  fontSize = FontSizeENUM;

  themes = ThemeENUM;

  languages = Object.values(LanguagesENUM)
    .filter((x) => typeof x === 'string')
    .map((z: string) => z.toLowerCase());

  userName;

  public photoError = false;

  destroy = new Subject<void>();

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    private rend: Renderer2,
    private authService: AuthService,
  ) {}

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.Profile)).toPromise();
    this.userName = this.store.selectSnapshot(UserStore.getUser).name;

    this.store
      .select(AppStore.appLoaded)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (x: boolean) => {
        if (x) {
          this.store.dispatch(new LoadBackgrounds());
        }
      });

    this.pService.newButtonSubject
      .pipe(takeUntil(this.destroy))
      .subscribe(() => this.newBackground());
  }

  setLanguage(item: LanguagesENUM): void {
    this.store.dispatch(new ChangeLanguage(item));
  }

  setCurrent(id: string) {
    this.store.dispatch(new SetBackground(id));
  }

  removeBackground(id: string) {
    this.store.dispatch(new RemoveBackground(id));
    const user = this.store.selectSnapshot(UserStore.getUser);
    if (id === user.currentBackground.id) {
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
    if (value) {
      this.store.dispatch(new ChangeTheme(ThemeENUM.Light));
    } else {
      this.store.dispatch(new ChangeTheme(ThemeENUM.Dark));
    }
  }

  changeFontSize(value: boolean) {
    if (value) {
      this.store.dispatch(new ChangeFontSize(FontSizeENUM.Big));
    } else {
      this.store.dispatch(new ChangeFontSize(FontSizeENUM.Medium));
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

  changeSource() {
    this.photoError = true;
  }
}
