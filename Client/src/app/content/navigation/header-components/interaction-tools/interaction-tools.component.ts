import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { FolderStore } from 'src/app/content/folders/state/folders-state';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { ChangeTheme } from 'src/app/core/stateUser/user-action';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ThemeENUM } from 'src/app/shared/enums/ThemeEnum';
import {
  notification,
  PersonalizationService,
} from 'src/app/shared/services/personalization.service';

@Component({
  selector: 'app-interaction-tools',
  templateUrl: './interaction-tools.component.html',
  styleUrls: ['./interaction-tools.component.scss'],
  animations: [notification],
})
export class InteractionToolsComponent {
  @Select(AppStore.isNoteInner)
  public isNoteInner$: Observable<boolean>;

  @Select(AppStore.isProfile)
  public isProfile$: Observable<boolean>;

  @Select(FolderStore.activeMenu)
  public menuActiveFolders$: Observable<boolean>;

  @Select(NoteStore.activeMenu)
  public menuActiveNotes$: Observable<boolean>;

  isOpenNotification = false;

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

  isInputFocus = false;

  constructor(public pService: PersonalizationService, private store: Store) {}

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
}
