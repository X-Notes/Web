import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store, Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FolderStore } from 'src/app/content/folders/state/folders-state';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { searchDelay } from 'src/app/core/defaults/bounceDelay';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { ChangeTheme } from 'src/app/core/stateUser/user-action';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ThemeENUM } from 'src/app/shared/enums/ThemeEnum';
import {
  notification,
  PersonalizationService,
} from 'src/app/shared/services/personalization.service';
import { SearchService } from 'src/app/shared/services/search.service';

@Component({
  selector: 'app-interaction-tools',
  templateUrl: './interaction-tools.component.html',
  styleUrls: ['./interaction-tools.component.scss'],
  animations: [notification],
})
export class InteractionToolsComponent implements OnInit, OnDestroy {
  @Select(AppStore.getNotificationsCount)
  public notificationCount$: Observable<number>;

  @Select(AppStore.isNoteInner)
  public isNoteInner$: Observable<boolean>;

  @Select(AppStore.isProfile)
  public isProfile$: Observable<boolean>;

  @Select(FolderStore.activeMenu)
  public menuActiveFolders$: Observable<boolean>;

  @Select(NoteStore.activeMenu)
  public menuActiveNotes$: Observable<boolean>;

  @ViewChild('searchInput') searchInput: ElementRef;

  searchStrChanged: Subject<string> = new Subject<string>();

  searchResult = [];

  isOpenNotification = false;

  isInputFocus = false;

  searchStr: string;

  destroy = new Subject<void>();

  public positions = [
    new ConnectionPositionPair(
      {
        originX: 'end',
        originY: 'bottom',
      },
      { overlayX: 'end', overlayY: 'top' },
      16,
      10,
    ),
  ];

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    private router: Router,
    private searchService: SearchService,
  ) {}

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit() {
    this.searchStrChanged
      .pipe(debounceTime(searchDelay), distinctUntilChanged())
      .subscribe(async (searchStr) => {
        if (searchStr?.length > 2) {
          const items = await this.searchService.searchNotesAndFolder(searchStr).toPromise();
          const notes = items.noteSearchs.map((x) => ({ ...x, type: 'notes' }));
          const folders = items.folderSearchs.map((x) => ({ ...x, type: 'folders' }));
          this.searchResult = [...notes, ...folders];
          console.log(this.searchResult);
        } else {
          this.searchResult = [];
        }
      });
  }

  closeNotification() {
    this.isOpenNotification = false;
  }

  toggleOrientation() {
    this.pService.changeOrientation();
  }

  toggleTheme() {
    const userTheme = this.store.selectSnapshot(UserStore.getUserTheme);
    const themes = this.store.selectSnapshot(AppStore.getThemes);
    if (userTheme.name === ThemeENUM.Dark) {
      const whiteTheme = themes.find((x) => x.name === ThemeENUM.Light);
      this.store.dispatch(new ChangeTheme(whiteTheme));
    }
    if (userTheme.name === ThemeENUM.Light) {
      const blackTheme = themes.find((x) => x.name === ThemeENUM.Dark);
      this.store.dispatch(new ChangeTheme(blackTheme));
    }
  }

  searchData() {
    if (!this.pService.isWidth600()) {
      this.isInputFocus = !this.isInputFocus;
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      });
    }
  }

  unFocusSearch() {
    setTimeout(() => {
      this.isInputFocus = false;
    }, 200);
  }

  goTo(id: string, type: string) {
    if (type === 'notes') {
      this.router.navigateByUrl(`notes/${id}`);
      return;
    }
    this.router.navigateByUrl(`folders/${id}`);
  }
}
