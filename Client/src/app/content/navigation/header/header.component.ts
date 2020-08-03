import { Component, OnInit } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Theme } from 'src/app/shared/enums/Theme';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ShortUser } from 'src/app/core/models/short-user';
import { Select } from '@ngxs/store';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {


  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  theme = Theme;
  currentUrl: string;


  newButtonActive = false;
  selectAllActive = true;
  settingsActive = true;
  sectionAdd = true;
  selected = true;
  search = false;

  constructor(public pService: PersonalizationService, private router: Router) { }

  ngOnInit(): void {
    this.checkRout();
  }

  toggleTheme() {
    if (this.pService.theme === Theme.Light) {
      this.pService.theme = Theme.Dark;
    } else {
      this.pService.theme = Theme.Light;
    }
  }

  toggleSidebar() {
    this.pService.stateSidebar = !this.pService.stateSidebar;
  }

  cancelSelect() {
    this.selected = false;
    this.search = true;
    this.newButtonActive = true;
  }

  allSelected() {
    this.selected = true;
    this.search = false;
    this.newButtonActive = false;
  }

  toggleOrientation() {
    this.pService.orientationMobile = !this.pService.orientationMobile;
    setTimeout( () => this.pService.grid.refreshItems().layout(), 0);
  }

  checkRout() {
    this.routeChange(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd))
      .subscribe(event => { this.routeChange((event as NavigationEnd).url); });
  }

  routeChange(url: string) {
    switch (url) {
      case '/folders' : {
        this.currentUrl = 'folder';
        this.newButtonActive = true;
        this.selectAllActive = true;
        this.settingsActive = true;
        this.sectionAdd = true;
        break;
      }
      case '/notes' : {
        this.currentUrl = 'note';
        this.newButtonActive = false;
        this.selectAllActive = true;
        this.settingsActive = true;
        this.sectionAdd = true;
        break;
      }
      case '/labels' : {
        this.currentUrl = 'label';
        this.newButtonActive = true;
        this.selectAllActive = false;
        this.settingsActive = false;
        this.sectionAdd = true;
        break;
      }
      case '/labels/deleted' : {
        this.currentUrl = 'label';
        this.newButtonActive = false;
        this.selectAllActive = false;
        this.settingsActive = false;
        this.sectionAdd = true;
        break;
      }

      case '/profile' : {
        break;
      }

      default : {
        this.sectionAdd = false;
        break;
      }
    }
  }

  newButton() {
    this.pService.subject.next(true);
  }
}
