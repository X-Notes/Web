import { ElementRef, Injectable, OnDestroy, QueryList } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotesService } from 'src/app/content/notes/notes.service';
import { MurriService } from 'src/app/shared/services/murri.service';
import { ApiFullFolderService } from './api-full-folder.service';

@Injectable()
export class FullFolderNotesService implements OnDestroy {
  firstInitedMurri = false;

  destroy = new Subject<void>();

  constructor(
    public murriService: MurriService,
    private apiFullFolder: ApiFullFolderService,
    public noteService: NotesService,
  ) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  async loadNotes(folderId: string) {
    if (!this.firstInitedMurri) {
      this.noteService.notes = await this.apiFullFolder.getFolderNotes(folderId).toPromise();
    } else {
      await this.murriService.setOpacityFlagAsync(0, false);
      await this.murriService.wait(150);
      this.murriService.grid.destroy();
      this.noteService.notes = await this.apiFullFolder.getFolderNotes(folderId).toPromise();
      await this.murriService.initFolderNotesAsync();
      await this.murriService.setOpacityFlagAsync();
    }
  }

  murriInitialise(refElements: QueryList<ElementRef>) {
    refElements.changes.pipe(takeUntil(this.destroy)).subscribe(async (z) => {
      if (
        z.length === this.noteService.notes.length &&
        this.noteService.notes.length !== 0 &&
        !this.firstInitedMurri
      ) {
        await this.murriService.wait(100);
        await this.murriService.initFolderNotesAsync();
        await this.murriService.setOpacityFlagAsync();
        this.firstInitedMurri = true;
      }
    });
  }
}
