import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { SmallNote } from '../models/smallNote';
import { Store, Select } from '@ngxs/store';
import { SelectIdNote, UnSelectIdNote } from '../state/notes-actions';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { FontSize } from 'src/app/shared/enums/FontSize';


@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})

export class NoteComponent implements OnInit, OnDestroy {

  fontSize = FontSize;
  destroy = new Subject<void>();

  isHighlight = false;
  @Input() note: SmallNote;

  constructor(public pService: PersonalizationService,
              private store: Store) { }


  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.store.select(state => state.Notes.selectedIds)
    .pipe(takeUntil(this.destroy))
    .pipe(map(z => this.tryFind(z)))
    .subscribe(flag => this.isHighlight = flag);
  }

  tryFind(z: string[]): boolean {
    const exist = z.find(id => id === this.note.id);
    return exist !== undefined ? true : false;
  }

  highlight(id: string) {
    if (!this.isHighlight) {
      this.store.dispatch(new SelectIdNote(id));
    } else {
      this.store.dispatch(new UnSelectIdNote(id));
    }
  }

}
