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

  @ViewChild('overlay') overlay: ElementRef;
  userName;
  check = true;
  dropdownLanguage = false;
  theme = Theme;
  items: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 , 12, 13];

  constructor(public pService: PersonalizationService,
              private store: Store,
              private rend: Renderer2) { }

  ngOnInit(): void {
    this.pService.onResize();
    this.userName = this.store.selectSnapshot(UserStore.getUser).name;
  }

  toggle() {
    this.check = !this.check;
  }

  cancelSideBar() {
    this.pService.stateSidebar = false;
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
