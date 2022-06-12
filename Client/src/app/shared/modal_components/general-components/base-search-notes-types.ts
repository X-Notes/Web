import { Subject } from 'rxjs';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import { NoteTypeENUM } from '../../enums/note-types.enum';
import { MurriService } from '../../services/murri.service';

export class BaseSearchNotesTypes {
  selectTypes = ['all', 'personal', 'shared', 'archive', 'bin'];

  selectValue = 'all';

  searchStr = '';

  loaded = false;

  notes: SmallNote[] = [];

  viewNotes: SmallNote[] = [];

  firstInitedMurri = false;

  protected searchChanged$: Subject<string> = new Subject<string>();

  constructor(public murriService: MurriService) {}

  get isSearchActive(): boolean {
    return this.searchStr && this.searchStr.length > 0;
  }

  get isNotFound(): boolean {
    if (this.loaded && this.viewNotes.length === 0) return true;
    return this.isSearchActive && this.notes?.length === 0;
  }

  selectItem = async (item) => {
    const [all, personal, shared, archive, bin] = this.selectTypes;
    let tempNotes: SmallNote[] = [];
    this.selectValue = item;
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
        throw new Error('incorrect type');
      }
    }
    if (this.firstInitedMurri) {
      await this.murriService.destroyGridAsync();

      this.viewNotes = tempNotes;
      await this.murriService.initMurriPreviewDialogNoteAsync();
      await this.murriService.setOpacityFlagAsync(0);
    }
  };

  onSearch(value): void {
    this.searchStr = value;
    this.searchChanged$.next(value);
  }
}
