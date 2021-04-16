import { ElementRef, Injectable, OnDestroy, QueryList } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SmallNote } from 'src/app/content/notes/models/smallNote';
import { MurriService } from 'src/app/shared/services/murri.service';
import { ApiFullFolderService } from './api-full-folder.service';

@Injectable()
export class FullFolderNotesService implements OnDestroy {
  notes: SmallNote[] = [];

  firstInitedMurri = false;

  destroy = new Subject<void>();

  constructor(public murriService: MurriService, private apiFullNote: ApiFullFolderService) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  async loadNotes(folderId: string) {
    this.notes = await this.apiFullNote.getFolderNotes(folderId).toPromise();
  }

  murriInitialise(refElements: QueryList<ElementRef>) {
    refElements.changes.pipe(takeUntil(this.destroy)).subscribe(async (z) => {
      if (z.length === this.notes.length && this.notes.length !== 0 && !this.firstInitedMurri) {
        await this.murriService.wait(100);
        await this.murriService.initFolderNotes();
        await this.murriService.setOpacityFlagAsync();
        this.firstInitedMurri = true;
      }
    });
  }
}
