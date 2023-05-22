import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { Store, Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { searchDelay } from 'src/app/core/defaults/bounceDelay';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { ChangeTheme } from 'src/app/core/stateUser/user-action';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import {
  notification,
  PersonalizationService,
} from 'src/app/shared/services/personalization.service';
import { SearchService } from 'src/app/shared/services/search.service';
import { ContactUsComponent } from '../../../../shared/modal_components/contact-us/contact-us.component';

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

  @Select(UserStore.getUserTheme)
  public theme$: Observable<ThemeENUM>;

  @ViewChild('searchInput') searchInput: ElementRef;

  searchStrChanged: Subject<string> = new Subject<string>();

  searchResult = [];

  isOpenNotification = false;

  isInputFocus = false;

  searchStr: string;

  theme = ThemeENUM;

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
    public readonly pService: PersonalizationService,
    private readonly store: Store,
    private readonly router: Router,
    private readonly searchService: SearchService,
    private readonly dialog: MatDialog,
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
    if (userTheme === ThemeENUM.Dark) {
      this.store.dispatch(new ChangeTheme(ThemeENUM.Light));
    }
    if (userTheme === ThemeENUM.Light) {
      this.store.dispatch(new ChangeTheme(ThemeENUM.Dark));
    }
  }

  searchData() {
    if (!this.pService.isWidthMoreThan600()) {
      this.isInputFocus = !this.isInputFocus;
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      });
    }
  }

  contactUs() {
    const theme = this.store.selectSnapshot(UserStore.getUserTheme);
    const config: MatDialogConfig = {
      maxHeight: '90vh',
      maxWidth: '90vw',
      autoFocus: false,
      panelClass:
        theme === ThemeENUM.Light ? 'custom-dialog-class-light' : 'custom-dialog-class-dark',
    };
    this.dialog.open(ContactUsComponent, config);
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
