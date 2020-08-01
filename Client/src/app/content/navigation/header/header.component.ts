import { Component, OnInit } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Theme } from 'src/app/shared/enums/Theme';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ShortUser } from 'src/app/core/models/short-user';
import { Select, Store } from '@ngxs/store';
import { UnSelectAllNote, SelectAllNote, ChangeColorNote } from '../../notes/state/notes-actions';
import { RoutePathes } from 'src/app/shared/enums/RoutePathes';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { ColorPallete } from 'src/app/shared/enums/Colors';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {


  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  theme = Theme;
  routePath: RoutePathes;
  noteType: NoteType;

  newButtonActive = true;
  selectAllActive = true;
  settingsActive = true;

  constructor(public pService: PersonalizationService,
              private router: Router,
              private store: Store) { }

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
        this.routePath = RoutePathes.Folder;
        this.showAllButtons();
        break;
      }
      case '/notes' : {
        this.routePath = RoutePathes.Note;
        this.showAllButtons();
        this.noteType = NoteType.Private;
        break;
      }
      case '/notes/shared' : {
        this.routePath = RoutePathes.Note;
        this.showAllButtons();
        this.noteType = NoteType.Shared;
        break;
      }
      case '/notes/deleted' : {
        this.routePath = RoutePathes.Note;
        this.showAllButtons();
        this.noteType = NoteType.Deleted;
        break;
      }
      case '/notes/archive' : {
        this.routePath = RoutePathes.Note;
        this.showAllButtons();
        this.noteType = NoteType.Archive;
        break;
      }
      case '/labels' : {
        this.routePath = RoutePathes.Label;

        this.newButtonActive = true;
        this.selectAllActive = false;
        this.settingsActive = false;
        break;
      }
      case '/labels/deleted' : {
        this.routePath =  RoutePathes.Label;
        this.hideAllButtons();
        break;
      }
    }
  }

  hideAllButtons() {
    this.newButtonActive = false;
    this.selectAllActive = false;
    this.settingsActive = false;
  }
  showAllButtons() {
    this.newButtonActive = true;
    this.selectAllActive = true;
    this.settingsActive = true;
  }

  newButton() {
    this.pService.subject.next(true);
  }

  // Selection

  selectAll() {
   this.store.dispatch(new SelectAllNote(this.noteType));
  }

  unselectAll() {
    this.store.dispatch(new UnSelectAllNote());
  }

  // UPPER MENU FUNCTION
  changeColor() {
    this.store.dispatch(new ChangeColorNote(ColorPallete.BlueOne, this.noteType));
  }
}
