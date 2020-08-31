import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { SmallNote } from '../models/smallNote';
import { Store } from '@ngxs/store';
import { SelectIdNote, UnSelectIdNote, ClearUpdatelabelEvent } from '../state/notes-actions';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { Router } from '@angular/router';
import { NoteStore } from '../state/notes-state';
import { Label } from '../../labels/models/label';
import { NoteLabel } from '../models/noteLabel';
import { UpdateLabelEvent } from '../state/updateLabels';


@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})

export class NoteComponent implements OnInit, OnDestroy {

  selectedFlag = false;
  destroy = new Subject<void>();

  isHighlight = false;
  @Input() note: SmallNote;
  labels: NoteLabel[] = [];
  constructor(public pService: PersonalizationService,
              private store: Store,
              private router: Router) { }


  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {

    this.labels = this.note.labels.slice(this.note.labels.length - 2, this.note.labels.length);

    this.store.select(state => state.Notes.selectedIds)
    .pipe(takeUntil(this.destroy))
    .pipe(map(z => this.tryFind(z)))
    .subscribe(flag => this.isHighlight = flag);

    this.store.select(NoteStore.selectedCount)
    .pipe(takeUntil(this.destroy))
    .subscribe(x => {
      if (x > 0) {
        this.selectedFlag = true;
      } else {
        this.selectedFlag = false;
      }
    });

    this.store.select(NoteStore.updateLabelEvent)
    .pipe(takeUntil(this.destroy))
    .subscribe((values: UpdateLabelEvent[]) => {
      const value = values.find(x => x.id === this.note.id);
      if (value !== undefined) {
        this.note.labels = value.labels;
        this.labels = this.note.labels.slice(this.note.labels.length - 2, this.note.labels.length);
        this.store.dispatch(new ClearUpdatelabelEvent(this.note.id));
      }
    });
  }

  tryFind(z: string[]): boolean {
    const exist = z.find(id => id === this.note.id);
    return exist !== undefined ? true : false;
  }

  highlight(id: string) {
    if (!this.isHighlight) {
      const labelsIds = this.note.labels.map(x => x.id);
      this.store.dispatch(new SelectIdNote(id, labelsIds));
    } else {
      this.store.dispatch(new UnSelectIdNote(id));
    }
  }

  toNote() {
    const flag = this.store.selectSnapshot(NoteStore.selectedCount) > 0 ? true : false;
    if (flag) {
      this.highlight(this.note.id);
    } else {
      this.router.navigate([`notes/${this.note.id}`]);
    }
  }

}
