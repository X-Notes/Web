import { Component, Input } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { SmallNote } from '../../models/small-note.model';
import { NotesService } from '../../notes.service';

@Component({
  selector: 'app-left-section-content-notes-list',
  templateUrl: './left-section-content-notes-list.component.html',
  styleUrls: ['./left-section-content-notes-list.component.scss'],
  providers: [NotesService],
})
export class LeftSectionContentNotesListComponent {
  @Input()
  public notesLink: SmallNote[];

  constructor(public pService: PersonalizationService, public notesService: NotesService) {}
}
