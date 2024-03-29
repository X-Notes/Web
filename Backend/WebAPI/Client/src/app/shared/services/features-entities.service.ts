import { Store } from '@ngxs/store';
import { SmallFolder } from 'src/app/content/folders/models/folder.model';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import { SortedByENUM } from 'src/app/core/models/sorted-by.enum';
import { MurriEntityService } from './murri-entity.service';
import { MurriService } from './murri.service';

export abstract class FeaturesEntitiesService<
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

  transformSpread = <T extends SmallNote | SmallFolder>(items: T[]): T[] => {
    if(!items) return [];
    const ents = [...items];
    return ents.map((ent) => {
      return { ...ent, isSelected: false, lockRedirect: false };
    });
  };

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
