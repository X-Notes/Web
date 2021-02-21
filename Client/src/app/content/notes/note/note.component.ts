import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { SmallNote } from '../models/smallNote';
import { Store } from '@ngxs/store';
import { SelectIdNote, UnSelectIdNote } from '../state/notes-actions';
import { Router } from '@angular/router';
import { NoteStore } from '../state/notes-state';
import { FontSizeNaming } from 'src/app/shared/enums/FontSizeNaming';


@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})

export class NoteComponent implements OnInit, OnDestroy {

  fontSize = FontSizeNaming;

  @Input() note: SmallNote;

  constructor(public pService: PersonalizationService,
              private store: Store,
              private router: Router) { }


  ngOnDestroy(): void {

  }

  ngOnInit(): void {

  }

  highlight(id: string) {
    if (!this.note.isSelected) {
      const labelsIds = this.note.labels.map(x => x.id);
      this.store.dispatch(new SelectIdNote(id, labelsIds));
    } else {
      this.store.dispatch(new UnSelectIdNote(id));
    }
  }

  toNote() {
    const isSelectedMode = this.store.selectSnapshot(NoteStore.selectedCount) > 0 ? true : false;
    if (isSelectedMode) {
      this.highlight(this.note.id);
    } else {
      this.router.navigate([`notes/${this.note.id}`]);
    }
  }

}
