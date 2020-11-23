import { Component, OnInit, OnDestroy } from '@angular/core';
import { PersonalizationService,
         showMenuLeftRight } from 'src/app/shared/services/personalization.service';
import { Theme } from 'src/app/shared/enums/Theme';
import {  Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ShortUser } from 'src/app/core/models/short-user';
import { Select, Store } from '@ngxs/store';
import { MakePublicNotes, MakePrivateNotes } from '../../notes/state/notes-actions';
import { MakePublicFolders, MakePrivateFolders } from '../../folders/state/folders-actions';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { NoteStore } from '../../notes/state/notes-state';
import { FolderStore } from '../../folders/state/folders-state';
import { UpdateNewButton,  UpdateMenuActive } from 'src/app/core/stateApp/app-action';
import { MenuButtonsService } from '../menu-buttons.service';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { MurriService } from 'src/app/shared/services/murri.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [ showMenuLeftRight ],
  providers: [MurriService]
})
export class HeaderComponent implements OnInit, OnDestroy {

  destroy = new Subject<void>();

  // Upper Menu

  @Select(AppStore.getMenuActive)
  public menuActive$: Observable<boolean>;

  //

  @Select(AppStore.isNoteInner)
  public isNoteInner$: Observable<boolean>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  theme = Theme;
  router: EntityType;

  constructor(public pService: PersonalizationService,
              private store: Store,
              public menuButtonService: MenuButtonsService,
              public murriService: MurriService, ) { }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {

    this.store.select(NoteStore.activeMenu)
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.configShowMenu(x));

    this.store.select(FolderStore.activeMenu)
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.configShowMenu(x));

    this.store.select(AppStore.getRouting)
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.routeChange(x));
  }

  toggleSidebar() {
    this.pService.stateSidebar = !this.pService.stateSidebar;
  }

  configShowMenu(flag: boolean) {
    if (this.store.selectSnapshot(AppStore.isNoteInner)) {
      this.store.dispatch(new UpdateNewButton(false));
      return;
    }
    if (flag) {
      this.store.dispatch(new UpdateNewButton(false));
      this.store.dispatch(new UpdateMenuActive(true));
    } else {
      this.store.selectSnapshot(AppStore.isDelete) ? this.store.dispatch(new UpdateNewButton(false)) :
      this.store.dispatch(new UpdateNewButton(true));
      this.store.dispatch(new UpdateMenuActive(false));
    }
  }

  async routeChange(type: EntityType) {

    switch (type) {
      case EntityType.FolderPrivate: {
        await this.store.dispatch(new UpdateNewButton(true)).toPromise();
        this.menuButtonService.setItems(this.menuButtonService.foldersItemsPrivate);
        this.router = 3;
        break;
      }
      case EntityType.FolderShared: {
        await this.store.dispatch(new UpdateNewButton(true)).toPromise();
        this.menuButtonService.setItems(this.menuButtonService.foldersItemsShared);
        this.router = 3;
        break;
      }
      case EntityType.FolderArchive: {
        await this.store.dispatch(new UpdateNewButton(true)).toPromise();
        this.menuButtonService.setItems(this.menuButtonService.foldersItemsArchive);
        this.router = 3;
        break;
      }
      case EntityType.FolderDeleted: {
        await this.store.dispatch(new UpdateNewButton(false)).toPromise();
        this.menuButtonService.setItems(this.menuButtonService.foldersItemsDeleted);
        this.router = 3;
        break;
      }
      case EntityType.FolderInner: {
        // this.menuButtonService.setInnerFolder();
        break;
      }

      case EntityType.NotePrivate: {
        await this.store.dispatch(new UpdateNewButton(true)).toPromise();
        this.menuButtonService.setItems(this.menuButtonService.notesItemsPrivate);
        this.router = 3;
        break;
      }
      case EntityType.NoteShared: {
        await this.store.dispatch(new UpdateNewButton(true)).toPromise();
        this.menuButtonService.setItems(this.menuButtonService.notesItemsShared);
        this.router = 3;
        break;
      }
      case EntityType.NoteArchive: {
        await this.store.dispatch(new UpdateNewButton(true)).toPromise();
        this.menuButtonService.setItems(this.menuButtonService.notesItemsArchive);
        this.router = 3;
        break;
      }
      case EntityType.NoteDeleted: {
        await this.store.dispatch(new UpdateNewButton(false)).toPromise();
        this.menuButtonService.setItems(this.menuButtonService.notesItemsDeleted);
        this.router = 3;
        break;
      }
      case EntityType.NoteInner: {
       // await this.store.dispatch(new UpdateNewButton(false)).toPromise();
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
        this.router = 4;
        break;
      }

      case EntityType.LabelPrivate: {
        await this.store.dispatch(new UpdateNewButton(true)).toPromise();
        break;
      }
      case EntityType.LabelDeleted: {
        await this.store.dispatch(new UpdateNewButton(false)).toPromise();
        break;
      }


      case EntityType.Profile: {
        await this.store.dispatch(new UpdateNewButton(true)).toPromise();
        this.router = 2;
        break;
      }

      default: {
        console.log('default');
      }
    }
  }

  // UPPER MENU FUNCTION NOTES




  makePublic() {
    const noteType = this.store.selectSnapshot(AppStore.getRouting);
    this.store.dispatch(new MakePublicNotes(noteType));
  }

  makePrivate() {
    const noteType = this.store.selectSnapshot(AppStore.getRouting);
    this.store.dispatch(new MakePrivateNotes(noteType));
  }


  // UPPER MENU FUNCTIONS FOLDERS


  makePublicFolder() {
    const folderType = this.store.selectSnapshot(AppStore.getRouting);
    this.store.dispatch(new MakePublicFolders(folderType));
  }

  makePrivateFolder() {
    const folderType = this.store.selectSnapshot(AppStore.getRouting);
    this.store.dispatch(new MakePrivateFolders(folderType));
  }
}
