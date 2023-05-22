import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Store } from '@ngxs/store';
import { ChangeColorNote, UnSelectAllNote } from 'src/app/content/notes/state/notes-actions';
import {
  ChangeColorFolder,
  UnSelectAllFolder,
} from 'src/app/content/folders/state/folders-actions';
import { TranslateService } from '@ngx-translate/core';
import { NoteColorPallete } from '../../enums/note-colors.enum';
import { EnumUtil } from '../../services/enum.util';
import { EntityPopupType } from '../../models/entity-popup-type.enum';

@Component({
  selector: 'app-change-color',
  templateUrl: './change-color.component.html',
  styleUrls: ['./change-color.component.scss'],
})
export class ChangeColorComponent implements OnInit, OnDestroy {
  windowType = EntityPopupType;

  pallete = EnumUtil.getEnumValues(NoteColorPallete);

  current;

  date: Date = new Date();

  constructor(
    public dialogRef: MatDialogRef<ChangeColorComponent>,
    private store: Store,
    private apiTranslate: TranslateService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      currentWindowType: EntityPopupType;
      ids: string[];
    },
  ) {}

  ngOnInit(): void {
    this.current = this.pallete[0];
  }

  changeCurrent(color: string) {
    this.current = color;
  }

  async changeColor() {
    if (this.data.currentWindowType === EntityPopupType.Folder) {
      await this.store
        .dispatch(
          new ChangeColorFolder(this.current, this.data.ids, true, this.permissionsErrorMessage()),
        )
        .toPromise();
    }
    if (this.data.currentWindowType === EntityPopupType.Note) {
      await this.store
        .dispatch(
          new ChangeColorNote(this.current, this.data.ids, true, this.permissionsErrorMessage()),
        )
        .toPromise();
    }
    this.dialogRef.close();
  }

  shadeColor = (color, percent) => {
    return `#${color
      .replace(/^#/, '')
      .replace(/../g, (colorN) =>
        `0${Math.min(255, Math.max(0, parseInt(colorN, 16) + percent)).toString(16)}`.substr(-2),
      )}`;
  };

  ngOnDestroy(): void {
    this.store.dispatch(new UnSelectAllNote());
    this.store.dispatch(new UnSelectAllFolder());
  }

  private permissionsErrorMessage = (): string =>
    this.apiTranslate.instant('snackBar.noPermissionsForEdit');
}
