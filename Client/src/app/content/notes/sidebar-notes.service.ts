import { ElementRef, Injectable, OnDestroy, QueryList } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MurriService } from 'src/app/shared/services/murri.service';
import { MenuButtonsService } from '../navigation/menu-buttons.service';
import { ApiRelatedNotesService } from './api-related-notes.service';
import { ChangeStateRelatedNote } from './models/changeStateRelatedNote';
import { RelatedNote } from './models/relatedNote';
import { SmallNote } from './models/smallNote';

@Injectable()
export class SidebarNotesService implements OnDestroy {
  destroy = new Subject<void>();

  firstInitedMurri = false;

  notes: RelatedNote[] = [];

  constructor(
    private apiRelatedNotes: ApiRelatedNotesService,
    public murriService: MurriService,
    public buttonService: MenuButtonsService,
  ) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  async loadNotes(id: string) {
    this.notes = await this.apiRelatedNotes.getRelatedNotes(id).toPromise();
  }

  murriInitialise(refElements: QueryList<ElementRef>) {
    refElements.changes.pipe(takeUntil(this.destroy)).subscribe(async (z) => {
      if (z.length === this.notes.length && this.notes.length !== 0 && !this.firstInitedMurri) {
        this.murriService.gridSettings(
          '.grid-item-small',
          document.querySelector('.grid') as HTMLElement,
          true,
        );
        this.murriService.setOpacityTrueAsync();
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
    const instance = this.buttonService.openSideModal();
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

  async changeState(state: ChangeStateRelatedNote, noteId: string) {
    await this.apiRelatedNotes.updateState(noteId, state.relatedNoteId, state.isOpened).toPromise();
  }
}
