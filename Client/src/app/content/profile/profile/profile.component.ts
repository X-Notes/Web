import { Component, OnInit, Renderer2, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen, showHistory } from 'src/app/shared/services/personalization.service';
import { Select, Store } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Observable, Subject } from 'rxjs';
import { Language } from 'src/app/shared/enums/Language';
import { ChangeLanguage, ChangeFontSize, ChangeTheme, UpdateUserName  } from 'src/app/core/stateUser/user-action';
import { FontSize } from 'src/app/shared/enums/FontSize';
import { ShortUser } from 'src/app/core/models/short-user';
import { EnumUtil } from 'src/app/shared/services/enum.util';
import { AuthService } from 'src/app/core/auth.service';
import { Router } from '@angular/router';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { takeUntil } from 'rxjs/operators';
import { Background } from 'src/app/core/models/background';
import { BackgroundStore } from 'src/app/core/backgrounds/background-state';
import { LoadBackgrounds, NewBackground, RemoveBackground, SetBackground } from 'src/app/core/backgrounds/background-action';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [ sideBarCloseOpen, showHistory ]
})
export class ProfileComponent implements OnInit, OnDestroy {

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  @Select(UserStore.getUserFontSize)
  public fontSize$: Observable<FontSize>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @Select(UserStore.getUserLanguage)
  public language$: Observable<Language>;

  @Select(BackgroundStore.getUserBackgrounds)
  public backgrounds$: Observable<Background[]>;

  @ViewChild('uploadFile') uploadPhoto: ElementRef;

  @ViewChild('overlay') overlay: ElementRef;
  userName;
  dropdownLanguage = false;
  languages = EnumUtil.getEnumValues(Language);
  theme = Theme;

  destroy = new Subject<void>();

  constructor(public pService: PersonalizationService,
              private store: Store,
              private rend: Renderer2,
              private authService: AuthService,
              private router: Router) { }

  async ngOnInit() {
    this.store.dispatch(new LoadBackgrounds());
    await this.store.dispatch(new UpdateRoute(EntityType.Profile)).toPromise();
    this.pService.onResize();
    this.userName = this.store.selectSnapshot(UserStore.getUser).name;

    this.pService.subject
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.newBackground());
  }

  setLanguage(item: any): void  {
    switch (item) {
      case 'Ukraine':
        this.store.dispatch(new ChangeLanguage(Language.UA));
        break;
      case 'Russian':
        this.store.dispatch(new ChangeLanguage(Language.RU));
        break;
      case 'English':
        this.store.dispatch(new ChangeLanguage(Language.EN));
        break;
    }
  }

  setCurrent(id: number) {
    this.store.dispatch(new SetBackground(id));
  }

  removeBackground(id: number) {
    this.store.dispatch(new RemoveBackground(id));
  }

  cancelSideBar() {
    this.pService.stateSidebar = false;
  }

  logout() {
    this.authService.logout();
  }

  showDropdown() {
    this.dropdownLanguage = !this.dropdownLanguage;
    if (this.dropdownLanguage) {
      this.rend.setStyle(this.overlay.nativeElement, 'display', 'block');
    } else {
      this.rend.setStyle(this.overlay.nativeElement, 'display', 'none');
    }
  }

  updateName() {
    const oldName = this.store.selectSnapshot(UserStore.getUser).name;
    if (oldName !== this.userName) {
      this.store.dispatch(new UpdateUserName(this.userName));
    }
  }

  cancelDropdown() {
    this.dropdownLanguage = true;
    this.rend.setStyle(this.overlay.nativeElement, 'display', 'none');
  }

  changeLanguage(event) {
    this.store.dispatch(new ChangeLanguage(Language.EN));
  }

  changeTheme() {
    this.store.dispatch(new ChangeTheme());
  }

  changeFontSize() {
    this.store.dispatch(new ChangeFontSize());
  }

  async newBackground() {
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

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

}
