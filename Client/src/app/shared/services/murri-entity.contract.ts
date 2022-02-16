import { ElementRef, QueryList } from '@angular/core';
import { SmallFolder } from 'src/app/content/folders/models/folder.model';
import { Label } from 'src/app/content/labels/models/label.model';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import { FolderTypeENUM } from '../enums/folder-types.enum';
import { NoteTypeENUM } from '../enums/note-types.enum';

export interface IMurriEntityService<
  T extends Label | SmallNote | SmallFolder,
  K extends NoteTypeENUM | FolderTypeENUM | boolean
> {
  initializeEntities(notes: T[]): Promise<void>;
  murriInitialise(refElements: QueryList<ElementRef>, type: K): void;
}
