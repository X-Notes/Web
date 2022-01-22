import { Store } from '@ngxs/store';
import { SmallFolder } from 'src/app/content/folders/models/folder.model';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import { UpdateColor } from 'src/app/content/notes/state/update-color.model';
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
        throw new Error('Incorrec type');
      }
    }
  };

  changeColorHandler(updateColor: UpdateColor[]) {
    for (const update of updateColor) {
      if (this.entities.length > 0) {
        this.entities.find((x) => x.id === update.id).color = update.color;
      }
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
