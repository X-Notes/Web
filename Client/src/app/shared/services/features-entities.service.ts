import { Store } from '@ngxs/store';
import { SmallFolder } from 'src/app/content/folders/models/folder.model';
import { ClearUpdatesUIFolders } from 'src/app/content/folders/state/folders-actions';
import { UpdateFolderUI } from 'src/app/content/folders/state/update-folder-ui.model';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import { ClearUpdatesUINotes } from 'src/app/content/notes/state/notes-actions';
import { UpdateNoteUI } from 'src/app/content/notes/state/update-note-ui.model';
import { SortedByENUM } from 'src/app/core/models/sorted-by.enum';
import { MurriEntityService } from './murri-entity.service';
import { MurriService } from './murri.service';

export class FeaturesEntitiesService<
  Entity extends SmallNote | SmallFolder,
> extends MurriEntityService<Entity> {
  constructor(public store: Store, murriService: MurriService) {
    super(murriService);
  }

  orderBy = <T extends SmallNote | SmallFolder>(entities: T[], sortType: SortedByENUM): T[] => {
    switch (sortType) {
      case SortedByENUM.AscDate: {
        return entities.sort(
          (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
        );
      }
      case SortedByENUM.DescDate: {
        return entities.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
      }
      case SortedByENUM.CustomOrder: {
        return entities.sort((a, b) => a.order - b.order);
      }
      default: {
        throw new Error('Incorrect type');
      }
    }
  };

  async updateNotes(updates: UpdateNoteUI[]) {
    for (const value of updates) {
      const note = this.entities.find((x) => x.id === value.id) as SmallNote;
      if (note !== undefined) {
        if (value.removeLabelIds && value.removeLabelIds.length > 0) {
          note.labels = note.labels.filter((x) => !value.removeLabelIds.some((id) => x.id === id));
        }
        if (value.addLabels && value.addLabels.length > 0) {
          note.labels = [...note.labels, ...value.addLabels];
        }
        if (value.allLabels) {
          note.labels = value.allLabels;
        }
        note.color = value.color ?? note.color;
        note.title = value.title ?? note.title;
        note.isCanEdit = value.isCanEdit ?? note.isCanEdit;
        note.isLocked = value.isLocked ?? note.isLocked;
        note.isLockedNow = value.isLockedNow ?? note.isLockedNow;
        note.unlockedTime = value.unlockedTime ?? note.unlockedTime;
      }
    }
    if (updates.length > 0) {
      await this.store.dispatch(new ClearUpdatesUINotes()).toPromise();
      await this.murriService.refreshLayoutAsync();
    }
  }

  async updateFolders(updates: UpdateFolderUI[]) {
    for (const value of updates) {
      const folder = this.entities.find((x) => x.id === value.id) as SmallFolder;
      if (folder !== undefined) {
        folder.color = value.color ?? folder.color;
        folder.title = value.title ?? folder.title;
        folder.isCanEdit = value.isCanEdit ?? folder.isCanEdit;
      }
    }
    if (updates.length > 0) {
      await this.store.dispatch(new ClearUpdatesUIFolders()).toPromise();
      await this.murriService.refreshLayoutAsync();
    }
  }

  transformSpread = <T extends SmallNote | SmallFolder>(items: T[]): T[] => {
    const ents = [...items];
    return ents.map((ent) => {
      return { ...ent, isSelected: false, lockRedirect: false };
    });
  };

  handleSelectEntities(ids: string[]) {
    if (ids) {
      for (const ent of this.entities) {
        if (ids.some((x) => x === ent.id)) {
          ent.isSelected = true;
        } else {
          ent.isSelected = false;
        }
      }
    }
  }

  handleLockRedirect(count: number) {
    if (count > 0) {
      for (const note of this.entities) {
        note.lockRedirect = true;
      }
    } else {
      for (const note of this.entities) {
        note.lockRedirect = false;
      }
    }
  }
}
