import { Subject } from 'rxjs';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import { NoteTypeENUM } from '../../enums/note-types.enum';
import { MurriService } from '../../services/murri.service';
import { SearchNotesTypesEnum } from './enums/search-notes-types.enum';

export class BaseSearchNotesTypes {
  searchStr = '';

  loaded = false;

  notes: SmallNote[] = [];

  viewNotes: SmallNote[] = [];

  defaultValue = SearchNotesTypesEnum.all;

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

  selectItem = async (item: SearchNotesTypesEnum) => {
    let tempNotes: SmallNote[] = [];
    this.defaultValue = item;
    switch (item) {
      case SearchNotesTypesEnum.all: {
        tempNotes = [...this.notes];
        break;
      }
      case SearchNotesTypesEnum.personal: {
        tempNotes = [...this.notes].filter((note) => note.noteTypeId === NoteTypeENUM.Private);
        break;
      }
      case SearchNotesTypesEnum.shared: {
        tempNotes = [...this.notes].filter((note) => note.noteTypeId === NoteTypeENUM.Shared);
        break;
      }
      case SearchNotesTypesEnum.archive: {
        tempNotes = [...this.notes].filter((note) => note.noteTypeId === NoteTypeENUM.Archive);
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
