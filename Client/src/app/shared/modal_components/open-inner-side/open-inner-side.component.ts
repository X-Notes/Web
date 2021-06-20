/* eslint-disable no-param-reassign */
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
import { ApiRelatedNotesService } from 'src/app/content/notes/api-related-notes.service';
import { PreviewNote } from 'src/app/content/notes/models/PreviewNote';
import { UnSelectAllNote } from 'src/app/content/notes/state/notes-actions';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { searchDelay } from 'src/app/core/defaults/bounceDelay';
import { FontSizeENUM } from '../../enums/FontSizeEnum';
import { NoteTypeENUM } from '../../enums/NoteTypesEnum';
import { MurriService } from '../../services/murri.service';
import { PersonalizationService, showDropdown } from '../../services/personalization.service';

@Component({
  selector: 'app-open-inner-side',
  templateUrl: './open-inner-side.component.html',
  styleUrls: ['./open-inner-side.component.scss'],
  animations: [showDropdown],
  providers: [MurriService],
})
export class OpenInnerSideComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  loaded = false;

  fontSize = FontSizeENUM;

  destroy = new Subject<void>();

  selectTypes = ['all', 'personal', 'shared', 'archive', 'bin'];

  currentType: string;

  notes: PreviewNote[] = [];

  viewNotes: PreviewNote[] = [];

  firstInitedMurri = false;

  searchChanged: Subject<string> = new Subject<string>();

  constructor(
    private store: Store,
    public murriService: MurriService,
    public pService: PersonalizationService,
    public dialogRef: MatDialogRef<OpenInnerSideComponent>,
    private apiRelatedNotes: ApiRelatedNotesService,
  ) {}

  async ngAfterViewInit(): Promise<void> {
    this.refElements.changes.pipe(takeUntil(this.destroy)).subscribe(async (z) => {
      if (z.length === this.viewNotes.length && !this.firstInitedMurri) {
        this.murriService.initMurriPreviewDialogNote();
        await this.murriService.setOpacityFlagAsync();
        this.firstInitedMurri = true;
      }
    });
  }

  ngOnInit() {
    this.initSearch();
    const [firstItem] = this.selectTypes;
    this.currentType = firstItem;
    this.pService.setSpinnerState(true);
    this.dialogRef
      .afterOpened()
      .pipe(takeUntil(this.destroy))
      .subscribe(async () => {
        this.loadContent();
      });
  }

  initSearch() {
    const noteId = this.store.selectSnapshot(NoteStore.oneFull).id;
    this.searchChanged
      .pipe(debounceTime(searchDelay), distinctUntilChanged(), takeUntil(this.destroy))
      .subscribe(async (str) => {
        this.pService.setSpinnerState(true);
        await this.murriService.setOpacityFlagAsync(0, false);
        await this.murriService.wait(150);
        this.murriService.grid.destroy();
        this.notes = await this.apiRelatedNotes.getAllPreviewNotes(noteId, str).toPromise();
        this.viewNotes = [...this.notes];
        this.pService.setSpinnerState(false);
        await this.murriService.initMurriPreviewDialogNoteAsync();
        await this.murriService.setOpacityFlagAsync(0);
      });
  }

  async loadContent() {
    const noteId = this.store.selectSnapshot(NoteStore.oneFull).id;
    this.notes = await this.apiRelatedNotes.getAllPreviewNotes(noteId, '').toPromise();
    this.viewNotes = [...this.notes];

    await this.pService.waitPreloading();
    this.pService.setSpinnerState(false);
    this.loaded = true;
  }

  // eslint-disable-next-line class-methods-use-this
  highlightNote(note: PreviewNote) {
    note.isSelected = !note.isSelected;
  }

  // eslint-disable-next-line class-methods-use-this
  unSelectNote(note: PreviewNote) {
    note.isSelected = false;
  }

  get selectedNotesChips() {
    return this.notes.filter((x) => x.isSelected);
  }

  ngOnDestroy(): void {
    this.murriService.flagForOpacity = false;
    this.murriService.muuriDestroy();
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new UnSelectAllNote());
  }

  selectItem = async (item) => {
    const [all, personal, shared, archive, bin] = this.selectTypes;
    let tempNotes: PreviewNote[] = [];
    switch (item) {
      case all: {
        tempNotes = [...this.notes];
        break;
      }
      case personal: {
        tempNotes = [...this.notes].filter((note) => note.noteTypeId === NoteTypeENUM.Private);
        break;
      }
      case shared: {
        tempNotes = [...this.notes].filter((note) => note.noteTypeId === NoteTypeENUM.Shared);
        break;
      }
      case archive: {
        tempNotes = [...this.notes].filter((note) => note.noteTypeId === NoteTypeENUM.Archive);
        break;
      }
      case bin: {
        tempNotes = [...this.notes].filter((note) => note.noteTypeId === NoteTypeENUM.Deleted);
        break;
      }
      default: {
        break;
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
}
