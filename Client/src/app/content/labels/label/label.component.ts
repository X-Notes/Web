import { Component, OnInit, Input, OnDestroy, Output, EventEmitter, Optional } from '@angular/core';
import {
  changeColorLabel,
  PersonalizationService,
} from 'src/app/shared/services/personalization.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { LabelsColor } from 'src/app/shared/enums/labels-colors.enum';
import { EnumUtil } from 'src/app/shared/services/enum.util';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { MurriService } from 'src/app/shared/services/murri.service';
import { FontSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { updateTitleEntitesDelay } from 'src/app/core/defaults/bounceDelay';
import { SnackBarWrapperService } from 'src/app/shared/services/snackbar/snack-bar-wrapper.service';
import { TranslateService } from '@ngx-translate/core';
import { AddLabelOnNote, RemoveLabelFromNote } from '../../notes/state/notes-actions';
import { NoteStore } from '../../notes/state/notes-state';
import { Label } from '../models/label.model';

@Component({
  selector: 'app-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss'],
  animations: [changeColorLabel],
})
export class LabelComponent implements OnInit, OnDestroy {
  @Input() label: Label;

  @Input() isSelected: boolean;

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
    private sbws: SnackBarWrapperService,
    private apiTranslate: TranslateService,
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
      .pipe(debounceTime(updateTitleEntitesDelay), distinctUntilChanged(), takeUntil(this.destroy))
      .subscribe((name) => {
        if (name) {
          this.label = { ...this.label, name };
          this.updateLabel.emit(this.label);
        }
      });
  }

  select() {
    let ids = this.store.selectSnapshot(NoteStore.selectedIds);
    const isInner = this.store.selectSnapshot(AppStore.isNoteInner);
    if (isInner) {
      ids = [...ids, this.store.selectSnapshot(NoteStore.oneFull).id];
    }
    if (!this.isSelected) {
      this.store.dispatch(
        new AddLabelOnNote(this.label, ids, true, this.permissionsErrorMessage()),
      );
    } else {
      this.store.dispatch(
        new RemoveLabelFromNote(this.label.id, ids, true, this.permissionsErrorMessage()),
      );
    }
  }

  openColors() {
    this.isUpdate = !this.isUpdate;
    this.timeout(this.isUpdate);
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

  changed(text: string) {
    this.nameChanged.next(text);
  }

  private permissionsErrorMessage = (): string =>
    this.apiTranslate.instant('snackBar.noPermissionsForEdit');
}
