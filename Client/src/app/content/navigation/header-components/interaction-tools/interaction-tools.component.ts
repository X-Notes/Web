import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { FolderStore } from 'src/app/content/folders/state/folders-state';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { ChangeTheme } from 'src/app/core/stateUser/user-action';
import { notification, PersonalizationService } from 'src/app/shared/services/personalization.service';

@Component({
  selector: 'app-interaction-tools',
  templateUrl: './interaction-tools.component.html',
  styleUrls: ['./interaction-tools.component.scss'],
  animations: [notification]
})
export class InteractionToolsComponent implements OnInit {

  isOpenNotification = false;

  public positions = [
    new ConnectionPositionPair({
      originX: 'end',
      originY: 'bottom'},
      {overlayX: 'end',
      overlayY: 'top'},
      16, 10)
  ];

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

  closeNotification() {
    this.isOpenNotification = false;
  }

  toggleOrientation() {
    this.pService.changeOrientation();
  }

  toggleTheme() {
    this.store.dispatch(new ChangeTheme());
  }

}
