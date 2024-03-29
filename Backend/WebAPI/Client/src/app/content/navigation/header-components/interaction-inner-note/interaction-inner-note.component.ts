import { ElementRef, Renderer2, ViewChild, Component } from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { FullNote } from 'src/app/content/notes/models/full-note.model';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import {
  PersonalizationService,
  showMenuLeftRight,
} from 'src/app/shared/services/personalization.service';
import { DialogsManageService } from '../../services/dialogs-manage.service';
import { MenuButtonsService } from '../../services/menu-buttons.service';
import { PermissionsButtonsService } from '../../services/permissions-buttons.service';
import { GeneralButtonStyleType } from '../general-header-button/models/general-button-style-type.enum';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { ConnectionPositionPair } from '@angular/cdk/overlay';

@Component({
  selector: 'app-interaction-inner-note',
  templateUrl: './interaction-inner-note.component.html',
  styleUrls: ['./interaction-inner-note.component.scss'],
  animations: [showMenuLeftRight],
})
export class InteractionInnerNoteComponent {
  @Select(NoteStore.oneFull)
  note$: Observable<FullNote>;

  @Select(NoteStore.fullNoteShared)
  noteShared$: Observable<boolean>;

  @Select(NoteStore.fullNoteType)
  noteType$: Observable<NoteTypeENUM>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<ThemeENUM>;

  @ViewChild('heightPeople') heightPeople: ElementRef;

  @ViewChild('scrollbar') scrollbar: ElementRef;

  buttonStyleType = GeneralButtonStyleType;

  public positions = [
    new ConnectionPositionPair(
      {
        originX: 'center',
        originY: 'top',
      },
      { overlayX: 'end', overlayY: 'bottom' },
      0,
      0,
    ),
  ];

  constructor(
    public pService: PersonalizationService,
    public renderer: Renderer2,
    public buttonService: MenuButtonsService,
    public dialogsManageService: DialogsManageService,
    public pB: PermissionsButtonsService,
    private store: Store,
  ) {}

  openMenu() {
    this.pService.innerNoteMenuActive = true;
  }

  hideMenu() {
    this.pService.innerNoteMenuActive = false;
  }

  openRelatedNotesPopup() {
    const noteId = this.store.selectSnapshot(NoteStore.oneFull).id;
    const isCanEdit = this.store.selectSnapshot(NoteStore.canEdit);
    this.dialogsManageService.openRelatedNotes(noteId, isCanEdit);
  }
}
