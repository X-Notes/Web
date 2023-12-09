import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { SmallNote } from '../../models/small-note.model';
import { NotesService } from '../../notes.service';
import { BaseText } from 'src/app/editor/entities/contents/base-text';
import { ContentTypeENUM } from 'src/app/editor/entities/contents/content-types.enum';

@Component({
  selector: 'app-left-section-content-notes-list',
  templateUrl: './left-section-content-notes-list.component.html',
  styleUrls: ['./left-section-content-notes-list.component.scss'],
  providers: [NotesService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeftSectionContentNotesListComponent {
  @Input()
  public notesLink?: SmallNote[];

  @Input() loading = false;

  constructor(public pService: PersonalizationService, public notesService: NotesService) { }

  get notes(): SmallNote[] {
    return this.notesLink?.filter(x => (x.title && x.title !== '') || this.getBaseText(x).length > 0);
  }

  onClickNote(note: SmallNote): void {
    this.pService.sideBarActive$.next(false);
    this.notesService.toNote(note);
  }

  getBaseText(note: SmallNote): BaseText[] {
    return note.contents
      ?.filter(x => x.typeId === ContentTypeENUM.Text)
      .map(x => x as BaseText)
      .filter(x => x.isHaveText())
      .slice(0, 4) ?? [];
  }
}
