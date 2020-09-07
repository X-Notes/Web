import { Component, OnInit, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen, showHistory } from 'src/app/shared/services/personalization.service';
import { Select, Store } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Observable } from 'rxjs';
import { Language } from 'src/app/shared/enums/Language';
import { ChangeLanguage, ChangeFontSize, ChangeTheme } from 'src/app/core/stateUser/user-action';
import { FontSize } from 'src/app/shared/enums/FontSize';
import { ShortUser } from 'src/app/core/models/short-user';
import { EnumUtil } from 'src/app/shared/services/enum.util';
import { AuthService } from 'src/app/core/auth.service';
import { Router } from '@angular/router';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [ sideBarCloseOpen, showHistory ]
})
export class ProfileComponent implements OnInit {

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  @Select(UserStore.getUserFontSize)
  public fontSize$: Observable<FontSize>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @Select(UserStore.getUserLanguage)
  public language$: Observable<Language>;

  @ViewChild('overlay') overlay: ElementRef;
  userName;
  check = true;
  dropdownLanguage = false;
  languages = EnumUtil.getEnumValues(Language);
  theme = Theme;
  items: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 , 12, 13];

  constructor(public pService: PersonalizationService,
              private store: Store,
              private rend: Renderer2,
              private authService: AuthService,
              private router: Router) { }

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.Profile)).toPromise();
    this.pService.onResize();
    this.userName = this.store.selectSnapshot(UserStore.getUser).name;
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

  toggle() {
    this.check = !this.check;
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
}
