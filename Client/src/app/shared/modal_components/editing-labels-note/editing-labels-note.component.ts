import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../dialog_data';
import { Store } from '@ngxs/store';
import { LabelStore } from 'src/app/content/labels/state/labels-state';
import { Label } from 'src/app/content/labels/models/label';
import { PersonalizationService } from '../../services/personalization.service';
import { UpdateLabel, SetDeleteLabel, AddLabel } from 'src/app/content/labels/state/labels-actions';
import { UnSelectAllNote } from 'src/app/content/notes/state/notes-actions';
import { AppStore } from 'src/app/core/stateApp/app-state';


@Component({
  selector: 'app-editing-labels-note',
  templateUrl: './editing-labels-note.component.html',
  styleUrls: ['./editing-labels-note.component.scss'],
  animations: []
})
export class EditingLabelsNoteComponent implements OnInit, OnDestroy {

  constructor(public dialogRef: MatDialogRef<EditingLabelsNoteComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData,
              public pService: PersonalizationService,
              private store: Store) { }

  public labels: Label[];

  loaded = false;
  searchStr = '';

  ngOnDestroy(): void {
    this.store.dispatch(new UnSelectAllNote());
  }

  async ngOnInit() {
    this.labels = this.store.selectSnapshot(LabelStore.all);
    await this.pService.waitPreloading();
    this.loaded = true;
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
