import { Component, OnInit } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { FolderStore } from 'src/app/content/folders/state/folders-state';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { ChangeTheme } from 'src/app/core/stateUser/user-action';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Theme } from 'src/app/shared/enums/Theme';
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
    // this.pService.orientationMobile = !this.pService.orientationMobile;
    // setTimeout( () => this.murriService.grid.refreshItems().layout(), 0);
  }

  toggleTheme() {
    this.store.dispatch(new ChangeTheme());
  }

}
