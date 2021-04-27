/* eslint-disable no-return-assign */
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ApiFullFolderService } from 'src/app/content/folders/full-folder/services/api-full-folder.service';
import { FolderStore } from 'src/app/content/folders/state/folders-state';
import { SmallNote } from 'src/app/content/notes/models/smallNote';
import { searchDelay } from 'src/app/core/defaults/bounceDelay';
import { FontSizeENUM } from '../../enums/FontSizeEnum';
import { NoteTypeENUM } from '../../enums/NoteTypesEnum';
import { MurriService } from '../../services/murri.service';
import { PersonalizationService } from '../../services/personalization.service';

@Component({
  selector: 'app-manage-notes-in-folder',
  templateUrl: './manage-notes-in-folder.component.html',
  styleUrls: ['./manage-notes-in-folder.component.scss'],
  providers: [MurriService],
})
export class ManageNotesInFolderComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  searchChanged: Subject<string> = new Subject<string>();

  loaded = false;

  destroy = new Subject<void>();

  selectTypes = ['all', 'personal', 'shared', 'archive', 'bin'];

  selectValue = 'all';

  fontSize = FontSizeENUM;

  notes: SmallNote[] = [];

  viewNotes: SmallNote[] = [];

  firstInitedMurri = false;

  constructor(
    public murriService: MurriService,
    public pService: PersonalizationService,
    private apiFullFolder: ApiFullFolderService,
    public dialogRef: MatDialogRef<ManageNotesInFolderComponent>,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.initSearch();
    this.pService.setSpinnerState(true);
    this.dialogRef
      .afterOpened()
      .pipe(takeUntil(this.destroy))
      .subscribe(async () => {
        this.loadContent();
      });
  }

  initSearch() {
    const folderId = this.store.selectSnapshot(FolderStore.full).id;
    this.searchChanged
      .pipe(debounceTime(searchDelay), distinctUntilChanged(), takeUntil(this.destroy))
      .subscribe(async (str) => {
        this.pService.setSpinnerState(true);
        await this.murriService.setOpacityFlagAsync(0, false);
        await this.murriService.wait(150);
        this.murriService.grid.destroy();
        this.notes = await this.apiFullFolder.getAllPreviewNotes(folderId, str).toPromise();
        this.viewNotes = [...this.notes];
        this.pService.setSpinnerState(false);
        await this.murriService.initMurriPreviewDialogNoteAsync();
        await this.murriService.setOpacityFlagAsync(0);
      });
  }

  async loadContent() {
    const folderId = this.store.selectSnapshot(FolderStore.full).id;
    this.notes = await this.apiFullFolder.getAllPreviewNotes(folderId, '').toPromise();
    this.viewNotes = [...this.notes];

    await this.pService.waitPreloading();
    this.pService.setSpinnerState(false);
    this.loaded = true;
  }

  selectItem = async (item) => {
    const [all, personal, shared, archive, bin] = this.selectTypes;
    let tempNotes: SmallNote[] = [];
    switch (item) {
      case all: {
        tempNotes = [...this.notes];
        break;
      }
      case personal: {
        tempNotes = [...this.notes].filter((note) => note.noteType.name === NoteTypeENUM.Private);
        break;
      }
      case shared: {
        tempNotes = [...this.notes].filter((note) => note.noteType.name === NoteTypeENUM.Shared);
        break;
      }
      case archive: {
        tempNotes = [...this.notes].filter((note) => note.noteType.name === NoteTypeENUM.Archive);
        break;
      }
      case bin: {
        tempNotes = [...this.notes].filter((note) => note.noteType.name === NoteTypeENUM.Deleted);
        break;
      }
      default: {
        throw new Error('incorrect type');
      }
    }
    if (this.firstInitedMurri) {
      await this.murriService.setOpacityFlagAsync(0, false);
      await this.murriService.wait(150);
      this.murriService.grid.destroy();
      this.viewNotes = tempNotes;
      await this.murriService.initMurriPreviewDialogNoteAsync();
      await this.murriService.setOpacityFlagAsync(0);
    }
  };

  async ngAfterViewInit(): Promise<void> {
    this.refElements.changes.pipe(takeUntil(this.destroy)).subscribe(async (z) => {
      if (z.length === this.viewNotes.length && !this.firstInitedMurri) {
        this.murriService.initMurriPreviewDialogNote();
        await this.murriService.setOpacityFlagAsync();
        this.firstInitedMurri = true;
      }
    });
  }

  get selectedNotesChips() {
    return this.notes.filter((x) => x.isSelected);
  }

  // eslint-disable-next-line no-param-reassign
  highlightNote = (note: SmallNote) => (note.isSelected = !note.isSelected);

  // eslint-disable-next-line no-param-reassign
  unSelectNote = (note: SmallNote) => (note.isSelected = false);

  ngOnDestroy(): void {
    this.murriService.muuriDestroy();
    this.destroy.next();
    this.destroy.complete();
  }
}
