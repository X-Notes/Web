import { AfterViewInit, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DialogsManageService } from 'src/app/content/navigation/services/dialogs-manage.service';
import { RelatedNotesService } from 'src/app/content/notes/full-note/services/related-notes.service';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';

@Component({
  selector: 'app-related-notes-pop-up',
  templateUrl: './related-notes-pop-up.component.html',
  styleUrls: ['./related-notes-pop-up.component.scss'],
})
export class RelatedNotesPopUpComponent implements OnInit, AfterViewInit, OnDestroy {
  load = false;

  destroy = new Subject<void>();

  constructor(
    public relatedNotesService: RelatedNotesService,
    @Inject(MAT_DIALOG_DATA)
    public data: { canEdit: boolean; noteId: string },
    public dialogRef: MatDialogRef<RelatedNotesPopUpComponent>,
    private dialogsManageService: DialogsManageService,
  ) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => (this.load = true), 100);
  }

  openAddRelatedNotesPopup(): void {
    const instance = this.dialogsManageService.openAddRemoveRelatedNotesModal();
    instance
      .afterClosed()
      .pipe(takeUntil(this.destroy))
      .subscribe(async (notes: SmallNote[]) => {
        if (notes) {
          const ids = notes.map((x) => x.id);
          await this.relatedNotesService.updateRelatedNotes(this.data.noteId, ids);
        }
      });
  }
}
