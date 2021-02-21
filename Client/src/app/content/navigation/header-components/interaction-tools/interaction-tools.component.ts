import { Component, OnInit } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { FolderStore } from 'src/app/content/folders/state/folders-state';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { ChangeTheme } from 'src/app/core/stateUser/user-action';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ThemeNaming } from 'src/app/shared/enums/ThemeNaming';
import { Theme } from 'src/app/shared/models/Theme';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';

@Component({
  selector: 'app-interaction-tools',
  templateUrl: './interaction-tools.component.html',
  styleUrls: ['./interaction-tools.component.scss']
})
export class InteractionToolsComponent implements OnInit {

  @Select(AppStore.isNoteInner)
  public isNoteInner$: Observable<boolean>;

  @Select(AppStore.isProfile)
  public isProfile$: Observable<boolean>;

  @Select(FolderStore.activeMenu)
  public menuActiveFolders$: Observable<boolean>;

  @Select(NoteStore.activeMenu)
  public menuActiveNotes$: Observable<boolean>;

  constructor(public pService: PersonalizationService,
              private store: Store) { }

  ngOnInit(): void {
  }

  toggleOrientation() {
    this.pService.changeOrientation();
  }

  toggleTheme() {
    const userTheme = this.store.selectSnapshot(UserStore.getUserTheme);
    const themes = this.store.selectSnapshot(AppStore.getThemes);
    if (userTheme.name === ThemeNaming.Dark)
    {
      const whiteTheme = themes.find(x => x.name === ThemeNaming.Light);
      this.store.dispatch(new ChangeTheme(whiteTheme));
    }
    if (userTheme.name === ThemeNaming.Light){
      const blackTheme = themes.find(x => x.name === ThemeNaming.Dark);
      this.store.dispatch(new ChangeTheme(blackTheme));
    }
  }

}
