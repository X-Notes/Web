import { SortedByENUM } from './sorted-by.enum';

export interface PersonalizationSetting {
  notesInFolderCount: number;

  contentInNoteCount: number;

  isViewVideoOnNote: boolean;

  isViewAudioOnNote: boolean;

  isViewPhotosOnNote: boolean;

  isViewTextOnNote: boolean;

  isViewDocumentOnNote: boolean;

  sortedFolderByTypeId: SortedByENUM;

  sortedNoteByTypeId: SortedByENUM;
}
