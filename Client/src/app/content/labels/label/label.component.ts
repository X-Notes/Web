import { Component, OnInit, Input, OnDestroy, Output, EventEmitter, Optional } from '@angular/core';
import {
  changeColorLabel,
  PersonalizationService,
} from 'src/app/shared/services/personalization.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { LabelsColor } from 'src/app/shared/enums/LabelsColors';
import { EnumUtil } from 'src/app/shared/services/enum.util';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { MurriService } from 'src/app/shared/services/murri.service';
import { FontSizeENUM } from 'src/app/shared/enums/FontSizeEnum';
import { updateTitleEntitesDelay } from 'src/app/core/defaults/bounceDelay';
import {
  AddLabelOnNote,
  RemoveLabelFromNote,
  UpdateLabelFullNote,
} from '../../notes/state/notes-actions';
import { NoteStore } from '../../notes/state/notes-state';
import { RestoreLabel } from '../state/labels-actions';
import { Label } from '../models/label';

@Component({
  selector: 'app-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss'],
  animations: [changeColorLabel],
})
export class LabelComponent implements OnInit, OnDestroy {
  @Input() label: Label;

  @Output() updateLabel = new EventEmitter<Label>();

  @Output() deleteLabel = new EventEmitter<Label>();

  @Output() restoreLabel = new EventEmitter<Label>();

  @Input() selectedMode: boolean;

  destroy = new Subject<void>();

  fontSize = FontSizeENUM;

  pallete = EnumUtil.getEnumValues(LabelsColor);

  isUpdate = false;

  nameChanged: Subject<string> = new Subject<string>();

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    @Optional() private murriService: MurriService,
  ) {}

  ngOnDestroy(): void {
    this.nameChanged.next();
    this.nameChanged.complete();
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.nameChanged
      .pipe(debounceTime(updateTitleEntitesDelay), distinctUntilChanged())
      .subscribe((name) => {
        if (name) {
          this.label = { ...this.label, name };
          this.updateLabel.emit(this.label);
        }
      });
  }

  select() {
    const ids = this.store.selectSnapshot(NoteStore.selectedIds);
    const isInner = this.store.selectSnapshot(AppStore.isNoteInner);
    if (isInner) {
      const flag = this.label.isSelected;
      this.store.dispatch(new UpdateLabelFullNote(this.label, flag));
    } else {
      const noteType = this.store.selectSnapshot(AppStore.getTypeNote);
      const type = this.store
        .selectSnapshot(AppStore.getNoteTypes)
        .find((x) => x.name === noteType);
      if (!this.label.isSelected) {
        this.store.dispatch(new AddLabelOnNote(this.label, type, ids));
      } else {
        this.store.dispatch(new RemoveLabelFromNote(this.label, type, ids));
      }
    }
  }

  openColors() {
    this.isUpdate = !this.isUpdate;
    this.timeout(this.isUpdate);
  }

  async restore() {
    await this.store.dispatch(new RestoreLabel(this.label)).toPromise();
    this.restoreLabel.emit(this.label);
  }

  timeout(flag: boolean) {
    return new Promise((resolve) => {
      let count = 0;
      const timer = setInterval(() => {
        if (count === 60 && flag) {
          clearInterval(timer);
          resolve(null);
        } else if (count === 40 && flag === false) {
          clearInterval(timer);
          resolve(null);
        }
        if (this.murriService) {
          this.murriService.grid.refreshItems().layout();
        }
        count += 1;
      }, 10);
    });
  }

  async changeColor(value: string) {
    this.label = { ...this.label, color: value };
    this.isUpdate = false;
    await this.timeout(this.isUpdate);
    this.updateLabel.emit(this.label);
  }

  delete() {
    this.deleteLabel.emit(this.label);
  }

  changed(text: string) {
    this.nameChanged.next(text);
  }
}
