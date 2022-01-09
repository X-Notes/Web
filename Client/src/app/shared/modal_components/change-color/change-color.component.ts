import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Store, Select } from '@ngxs/store';
import { ChangeColorNote, UnSelectAllNote } from 'src/app/content/notes/state/notes-actions';
import { Observable } from 'rxjs/internal/Observable';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { ChangeColorFolder } from 'src/app/content/folders/state/folders-actions';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { FolderStore } from 'src/app/content/folders/state/folders-state';
import { TranslateService } from '@ngx-translate/core';
import { NoteColorPallete } from '../../enums/note-colors.enum';
import { EnumUtil } from '../../services/enum.util';
import { SnackBarWrapperService } from '../../services/snackbar/snack-bar-wrapper.service';

@Component({
  selector: 'app-change-color',
  templateUrl: './change-color.component.html',
  styleUrls: ['./change-color.component.scss'],
})
export class ChangeColorComponent implements OnInit, OnDestroy {
  @Select(AppStore.isNote)
  public isNote$: Observable<boolean>;

  @Select(AppStore.isFolder)
  public isFolder$: Observable<boolean>;

  @Select(AppStore.isFolderInner)
  public isFolderInner$: Observable<boolean>;

  pallete = EnumUtil.getEnumValues(NoteColorPallete);

  current;

  date: Date;

  constructor(
    public dialogRef: MatDialogRef<ChangeColorComponent>,
    private store: Store,
    private sbws: SnackBarWrapperService,
    private apiTranslate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.date = new Date();
    // eslint-disable-next-line prefer-destructuring
    this.current = this.pallete[0];
  }

  changeCurrent(color: string) {
    this.current = color;
  }

  async changeColor() {
    let routePath = this.store.selectSnapshot(AppStore.isNote);
    if (routePath) {
      if (this.store.selectSnapshot(AppStore.isNoteInner)) {
        const ids = [this.store.selectSnapshot(NoteStore.oneFull).id];
        await this.store
          .dispatch(new ChangeColorNote(this.current, ids, true, this.permissionsErrorCallback))
          .toPromise();
      } else {
        const ids = this.store.selectSnapshot(NoteStore.selectedIds);
        await this.store
          .dispatch(new ChangeColorNote(this.current, ids, true, this.permissionsErrorCallback))
          .toPromise();
      }
    }
    routePath = this.store.selectSnapshot(AppStore.isFolder);
    if (routePath) {
      if (this.store.selectSnapshot(AppStore.isFolderInner)) {
        const ids = this.store.selectSnapshot(NoteStore.selectedIds);
        await this.store
          .dispatch(new ChangeColorNote(this.current, ids, true, this.permissionsErrorCallback))
          .toPromise();
      } else {
        const ids = this.store.selectSnapshot(FolderStore.selectedIds);
        await this.store
          .dispatch(new ChangeColorFolder(this.current, ids, true, this.permissionsErrorCallback))
          .toPromise();
      }
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
  }

  private permissionsErrorCallback = () =>
    this.sbws.buildNotification(this.apiTranslate.instant('snackBar.noPermissionsForEdit'), null);
}
