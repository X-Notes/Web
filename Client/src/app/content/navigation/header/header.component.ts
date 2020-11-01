import { Component, OnInit, OnDestroy } from '@angular/core';
import { PersonalizationService, showMenuLeftRight } from 'src/app/shared/services/personalization.service';
import { Theme } from 'src/app/shared/enums/Theme';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Select, Store } from '@ngxs/store';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { NoteStore } from '../../notes/state/notes-state';
import { FolderStore } from '../../folders/state/folders-state';
import { MenuButtonsService } from '../menu-buttons.service';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { NoteType } from 'src/app/shared/enums/NoteTypes';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [showMenuLeftRight]
})
export class HeaderComponent implements OnInit, OnDestroy {

  destroy = new Subject<void>();

  newButtonActive = false;
  // Upper Menu

  @Select(AppStore.getDeleteAllLabellsButtonActive)
  public deleteAllLabeslButton$: Observable<boolean>;

  @Select(AppStore.getChangeViewButtonActive)
  public changeViewActive$: Observable<boolean>;

  @Select(FolderStore.activeMenu)
  public menuActiveFolders$: Observable<boolean>;

  @Select(NoteStore.activeMenu)
  public menuActiveNotes$: Observable<boolean>;

  @Select(AppStore.getSettingsButtonActive)
  public settingsButtonActive$: Observable<boolean>;

  @Select(AppStore.getSelectAllButtonActive)
  public selectAllButtonActive$: Observable<boolean>;

  @Select(AppStore.getdefaultBackground)
  public defaultBackground$: Observable<boolean>;

  @Select(AppStore.isNoteInner)
  public isNoteInner$: Observable<boolean>;

  @Select(AppStore.getName)
  public route$: Observable<string>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  theme = Theme;

  constructor(public pService: PersonalizationService,
              private store: Store,
              public menuButtonService: MenuButtonsService) { }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {

    this.store.select(AppStore.getNewButtonActive)
      .pipe(takeUntil(this.destroy))
      .subscribe(z => {
        this.newButtonActive = z;
      });

    this.store.select(AppStore.getRouting)
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.routeChange(x));

  }

  showUsers() {
    this.pService.users = !this.pService.users;
  }

  hideMenu() {
    this.pService.hideInnerMenu = !this.pService.hideInnerMenu;
  }


  disableTooltpUser(): boolean {
    if (this.pService.checkWidth()) {
      return true;
    }
  }

  closeMenu(): void {
    if (this.pService.checkWidth()) {
      this.pService.users = false;
    }

    if (!this.pService.check()) {
      this.pService.hideInnerMenu = false;
    }
  }


  async routeChange(type: EntityType) {

    switch (type) {
      case EntityType.FolderPrivate: {
        this.menuButtonService.setItems(this.menuButtonService.foldersItemsPrivate);
        break;
      }
      case EntityType.FolderShared: {
        this.menuButtonService.setItems(this.menuButtonService.foldersItemsShared);
        break;
      }
      case EntityType.FolderArchive: {
        this.menuButtonService.setItems(this.menuButtonService.foldersItemsArchive);
        break;
      }
      case EntityType.FolderDeleted: {
        this.menuButtonService.setItems(this.menuButtonService.foldersItemsDeleted);
        break;
      }
      case EntityType.NotePrivate: {
        this.menuButtonService.setItems(this.menuButtonService.notesItemsPrivate);
        break;
      }
      case EntityType.NoteShared: {
        this.menuButtonService.setItems(this.menuButtonService.notesItemsShared);
        break;
      }
      case EntityType.NoteArchive: {
        this.menuButtonService.setItems(this.menuButtonService.notesItemsArchive);
        break;
      }
      case EntityType.NoteDeleted: {
        this.menuButtonService.setItems(this.menuButtonService.notesItemsDeleted);
        break;
      }
      case EntityType.NoteInner: {
        switch (this.store.selectSnapshot(AppStore.getInnerNoteType)) {
          case NoteType.Private: {
            this.menuButtonService.setItems(this.menuButtonService.notesItemsPrivate);
            break;
          }
          case NoteType.Shared: {
            this.menuButtonService.setItems(this.menuButtonService.notesItemsShared);
            break;
          }
          case NoteType.Deleted: {
            this.menuButtonService.setItems(this.menuButtonService.notesItemsDeleted);
            break;
          }
          case NoteType.Archive: {
            this.menuButtonService.setItems(this.menuButtonService.notesItemsArchive);
            break;
          }
        }
        break;
      }
      default: {
        console.log('default');
      }
    }
  }

}
