import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { LabelStore } from 'src/app/content/labels/state/labels-state';
import { Label } from 'src/app/content/labels/models/label.model';
import { UpdateLabel, SetDeleteLabel, AddLabel } from 'src/app/content/labels/state/labels-actions';
import { UnSelectAllNote } from 'src/app/content/notes/state/notes-actions';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LabelSelect } from 'src/app/content/labels/models/label-select.model';
import { PersonalizationService, smoothOpacity } from '../../services/personalization.service';

@Component({
  selector: 'app-editing-labels-note',
  templateUrl: './editing-labels-note.component.html',
  styleUrls: ['./editing-labels-note.component.scss'],
  animations: [smoothOpacity()],
})
export class EditingLabelsNoteComponent implements OnInit, OnDestroy {
  destroy = new Subject<void>();

  loaded = false;

  searchStr = '';

  public labels: LabelSelect[];

  constructor(
    public dialogRef: MatDialogRef<EditingLabelsNoteComponent>,
    public pService: PersonalizationService,
    private store: Store,
  ) {}

  ngOnDestroy(): void {
    this.store.dispatch(new UnSelectAllNote());
    this.destroy.next();
    this.destroy.complete();
  }

  async ngOnInit() {
    this.initLabels();

    await this.pService.waitPreloading();
    this.loaded = true;
    this.checkSelect();
  }

  initLabels() {
    const labels = this.store.selectSnapshot(LabelStore.all);
    this.labels = this.transformLabels(labels);
  }

  transformLabels = (items: Label[]) => {
    return [...items].map((label) => {
      return { ...label, isSelectedValue: false };
    });
  };

  checkSelect() {
    const isInner = this.store.selectSnapshot(AppStore.isNoteInner);
    if (isInner) {
      this.store
        .select(NoteStore.oneFull)
        .pipe(takeUntil(this.destroy))
        .subscribe((note) => {
          if (note) {
            const ids = note.labels.map((label) => label.id);
            this.tryFind(ids);
          }
        });
    } else {
      this.store
        .select(NoteStore.labelsIds)
        .pipe(takeUntil(this.destroy))
        .subscribe((ids) => {
          this.tryFind(ids);
        });
    }
  }

  tryFind(labelIds: string[]) {
    for (const label of this.labels) {
      const flag = labelIds.some((x) => x === label.id);
      label.isSelectedValue = flag;
    }
  }

  changed(value): void {
    this.searchStr = value;
  }

  update(label: Label) {
    this.store.dispatch(new UpdateLabel(label));
  }

  deleteLabel(label: Label) {
    this.store.dispatch(new SetDeleteLabel(label));
  }

  async newLabel() {
    await this.store.dispatch(new AddLabel()).toPromise();
    const newLabel = this.store.selectSnapshot(LabelStore.all)[0] as LabelSelect;
    this.labels = [{...newLabel}, ...this.labels];
  }
}
