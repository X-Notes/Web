import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { LabelStore } from 'src/app/content/labels/state/labels-state';
import { Label } from 'src/app/content/labels/models/label';
import { PersonalizationService, smoothOpacity } from '../../services/personalization.service';
import { UpdateLabel, SetDeleteLabel, AddLabel } from 'src/app/content/labels/state/labels-actions';
import { UnSelectAllNote } from 'src/app/content/notes/state/notes-actions';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LabelsOnSelectedNotes } from 'src/app/content/notes/models/labelsOnSelectedNotes';

@Component({
  selector: 'app-editing-labels-note',
  templateUrl: './editing-labels-note.component.html',
  styleUrls: ['./editing-labels-note.component.scss'],
  animations: [smoothOpacity]
})
export class EditingLabelsNoteComponent implements OnInit, OnDestroy {

  constructor(public dialogRef: MatDialogRef<EditingLabelsNoteComponent>,
              public pService: PersonalizationService,
              private store: Store) { }

  public labels: Label[];

  destroy = new Subject<void>();

  loaded = false;
  searchStr = '';

  ngOnDestroy(): void {
    this.store.dispatch(new UnSelectAllNote());
    this.destroy.next();
    this.destroy.complete();
  }

  async ngOnInit() {
    const labels = this.store.selectSnapshot(LabelStore.all);
    this.labels = this.tranformLabels(labels);

    await this.pService.waitPreloading();
    this.loaded = true;
    this.checkSelect();
  }

  tranformLabels(labels: Label[]): Label[] {
    labels = [...labels];
    return labels.map(label => {
      const obj: Label = {
        id: label.id,
        color: label.color,
        countNotes: label.countNotes,
        isDeleted: label.isDeleted,
        isSelected: false,
        name: label.name
      };
      return obj;
    });
  }

  checkSelect() {
    const isInner = this.store.selectSnapshot(AppStore.isNoteInner);
    if (isInner) {
      this.store.select(NoteStore.oneFull)
        .pipe(takeUntil(this.destroy))
        .subscribe(note => {
          if (note) {
            this.tryFind([{ id: note.id, labelsIds: note.labels.map(label => label.id) }]);
          }
        });
    } else {
      this.store.select(NoteStore.labelsIds)
        .pipe(takeUntil(this.destroy))
        .subscribe(model => {
          if (model) {
            this.tryFind(model);
          }
        });
    }
  }

  tryFind(z: LabelsOnSelectedNotes[]) {
    const labels = this.tranformLabels(this.labels);
    this.labels = labels;
    for (const label of labels) {
      let flag = false;
      for (const item of z) {
        const check = item.labelsIds.some(x => x === label.id);
        if (check) {
          flag = true;
        }
      }
      if (flag) {
        label.isSelected = true;
      } else {
        label.isSelected = false;
      }
    }
  }

  changed(value): void {
    this.searchStr = value;
  }

  update(label: Label) {
    this.store.dispatch(new UpdateLabel(label));
  }

  delete(label: Label) {
    this.store.dispatch(new SetDeleteLabel(label));
  }

  async newLabel() {
    await this.store.dispatch(new AddLabel()).toPromise();
    const newLabel = this.store.selectSnapshot(LabelStore.all)[0];
    this.labels = [newLabel, ...this.labels];
  }


}
