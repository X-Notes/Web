import { Store } from '@ngxs/store';
import { SmallFolder } from 'src/app/content/folders/models/folder.model';
import { Label } from 'src/app/content/labels/models/label.model';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import { UpdateColor } from 'src/app/content/notes/state/update-color.model';
import { SortedByENUM } from 'src/app/core/models/sorted-by.enum';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { FolderTypeENUM } from '../enums/folder-types.enum';
import { NoteTypeENUM } from '../enums/note-types.enum';
import { MurriEntityService } from './murri-entity.service';
import { MurriService } from './murri.service';

export enum OrderFilterEntity {
  Note,
  Folder,
}

export class FeaturesEntitiesService<
  Entity extends SmallNote | SmallFolder
> extends MurriEntityService<Entity> {
  constructor(
    public store: Store,
    protected entityOrderType: OrderFilterEntity,
    public murriService: MurriService,
  ) {
    super(murriService);
  }

  get isShared() {
    if (this.entityOrderType === OrderFilterEntity.Note) {
      return this.store.selectSnapshot(AppStore.getTypeNote) === NoteTypeENUM.Shared;
    }
    if (this.entityOrderType === OrderFilterEntity.Folder) {
      return this.store.selectSnapshot(AppStore.getTypeFolder) === FolderTypeENUM.Shared;
    }
    throw Error('Incorrect type');
  }

  get orderField() {
    const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
    if (this.entityOrderType === OrderFilterEntity.Note) {
      return pr.sortedNoteByTypeId;
    }
    if (this.entityOrderType === OrderFilterEntity.Folder) {
      return pr.sortedFolderByTypeId;
    }
    throw Error('Incorrect type');
  }

  orderBy<T extends SmallNote | SmallFolder>(entities: T[]): T[] {
    if (this.isShared) {
      return entities.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    }

    switch (this.orderField) {
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
    }
  }

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
}
