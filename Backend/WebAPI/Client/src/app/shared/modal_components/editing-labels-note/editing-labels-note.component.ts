import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialogRef,  MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { LabelStore } from 'src/app/content/labels/state/labels-state';
import { Label } from 'src/app/content/labels/models/label.model';
import { UpdateLabel, SetDeleteLabel, AddLabel } from 'src/app/content/labels/state/labels-actions';
import {
  AddLabelOnNote,
  RemoveLabelFromNote,
  UnSelectAllNote,
} from 'src/app/content/notes/state/notes-actions';
import { Observable, Subject } from 'rxjs';
import { PersonalizationService, smoothOpacity } from '../../services/personalization.service';
import { map } from 'rxjs/operators';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-editing-labels-note',
  templateUrl: './editing-labels-note.component.html',
  styleUrls: ['./editing-labels-note.component.scss'],
  animations: [smoothOpacity()],
})
export class EditingLabelsNoteComponent implements OnInit, OnDestroy {
  @Select(LabelStore.noDeleted)
  public labels$?: Observable<Label[]>;

  @Select(LabelStore.countNoDeleted)
  countAll$?: Observable<number>;

  destroy = new Subject<void>();

  loaded = false;

  searchStr = '';

  filterMetadata = { count: 0 };

  constructor(
    public dialogRef: MatDialogRef<EditingLabelsNoteComponent>,
    public pService: PersonalizationService,
    private store: Store,
    private apiTranslate: TranslateService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      labelIds: Set<string>;
    },
  ) {}

  get labels(): Observable<Label[]> {
    return this.store
      .select(LabelStore.noDeleted)
      .pipe(map((labels) => labels.map((x) => ({ ...x }))));
  }

  get isSearchActive(): boolean {
    return this.searchStr && this.searchStr.length > 0;
  }

  get isNotFound(): boolean {
    return this.isSearchActive && this.filterMetadata.count === 0;
  }

  private get selectedIds(): Set<string> {
    const isInner = this.store.selectSnapshot(AppStore.isNoteInner);
    if (isInner) {
      return new Set([this.store.selectSnapshot(NoteStore.oneFull).id]);
    }
    return this.store.selectSnapshot(NoteStore.selectedIds);
  }

  ngOnDestroy(): void {
    this.store.dispatch(new UnSelectAllNote());
    this.destroy.next();
    this.destroy.complete();
  }

  async ngOnInit() {
    await this.pService.waitPreloading(); // need for scroll bar
    this.loaded = true;
  }

  isSelected(labelId: string): boolean {
    return this.data.labelIds.has(labelId);
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

  newLabel() {
    this.store.dispatch(new AddLabel());
  }

  async onSelectLabel(isSelected: boolean, label: Label): Promise<void> {
    const lId = label.id;
    if (isSelected) {
      const command = new AddLabelOnNote(lId, [...this.selectedIds], true, this.errorMessage());
      this.store.dispatch(command);
      this.data.labelIds.add(lId);
    } else {
      const command = new RemoveLabelFromNote(lId, [...this.selectedIds], true, this.errorMessage());
      this.store.dispatch(command);
      this.data.labelIds.delete(lId);
    }
  }

  trackByFn(index, item: Label) {
    return item.id;
  }

  private errorMessage = (): string => this.apiTranslate.instant('snackBar.noPermissionsForEdit');
}
