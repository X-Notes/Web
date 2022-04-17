import { ElementRef, Injectable, OnDestroy, QueryList } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MurriService } from 'src/app/shared/services/murri.service';
import { DialogsManageService } from '../../../navigation/services/dialogs-manage.service';
import { ApiRelatedNotesService } from '../../api-related-notes.service';
import { RelatedNote } from '../../models/related-note.model';
import { SmallNote } from '../../models/small-note.model';
import { MenuButtonsService } from 'src/app/content/navigation/services/menu-buttons.service';

@Injectable()
export class SidebarNotesService implements OnDestroy {
  destroy = new Subject<void>();

  firstInitedMurri = false;

  notes: RelatedNote[] = [];

  constructor(
    private apiRelatedNotes: ApiRelatedNotesService,
    public murriService: MurriService,
    public buttonService: MenuButtonsService,
    public dialogsManageService: DialogsManageService,
  ) {}

  ngOnDestroy(): void {
    this.murriService.muuriDestroy();
    this.destroy.next();
    this.destroy.complete();
  }

  async loadNotes(noteId: string) {
    if (!this.firstInitedMurri) {
      const notes = await this.apiRelatedNotes.getRelatedNotes(noteId).toPromise();
      this.notes = notes.sort((a, b) => a.order - b.order);
    } else {
      await this.murriService.setOpacityFlagAsync(0, false);
      await this.murriService.wait(150);
      this.murriService.grid.destroy();
      const notes = await this.apiRelatedNotes.getRelatedNotes(noteId).toPromise();
      this.notes = notes.sort((a, b) => a.order - b.order);
      await this.murriService.initSidebarNotesAsync(noteId);
      await this.murriService.setOpacityFlagAsync();
    }
  }

  murriInitialise(refElements: QueryList<ElementRef>, noteId: string) {
    refElements.changes.pipe(takeUntil(this.destroy)).subscribe(async (z) => {
      if (z.length === this.notes.length && this.notes.length !== 0 && !this.firstInitedMurri) {
        await this.murriService.wait(100);
        await this.murriService.initSidebarNotesAsync(noteId);
        await this.murriService.setOpacityFlagAsync();
        this.firstInitedMurri = true;
      }
    });
  }

  async deleteSmallNote(item: string, id: string) {
    let counter = 0;
    this.notes = this.notes.filter((x) => x.id !== item);
    await this.apiRelatedNotes
      .addToRelatedNotesNotes(
        id,
        this.notes.map((x) => x.id),
      )
      .toPromise();
    const interval = setInterval(() => {
      if (counter === 35) {
        clearInterval(interval);
      }
      this.murriService.grid.refreshItems().layout();
      counter += 1;
    }, 10);
  }

  openSideModal(noteId: string) {
    const instance = this.dialogsManageService.openRelatedNotesModal();
    instance
      .afterClosed()
      .pipe(takeUntil(this.destroy))
      .subscribe(async (notes: SmallNote[]) => {
        if (notes) {
          await this.apiRelatedNotes
            .addToRelatedNotesNotes(
              noteId,
              notes.map((x) => x.id),
            )
            .toPromise();
          this.loadNotes(noteId);
        }
      });
  }

  async changeState(note: RelatedNote) {
    await this.apiRelatedNotes.updateState(note.id, note.reletionId, note.isOpened).toPromise();
  }
}
