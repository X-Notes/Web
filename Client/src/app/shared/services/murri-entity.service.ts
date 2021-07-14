import { Label } from 'src/app/content/labels/models/label.model';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import { MurriService } from './murri.service';

export class MurriEntityService<Entity extends Label | SmallNote> {
  public entities: Entity[] = [];
  public state: Record<string, Entity> = {};
  firstInitedMurri = false;
  constructor(protected murriService: MurriService) {}

  newItemChecker(elements: HTMLElement[]) {
    for (const el of elements) {
      if (!this.state[el.id]) {
        this.state[el.id] = this.entities.find((x) => x.id === el.id);
        this.murriService.grid.add(document.getElementById(el.id), {
          index: 0,
          layout: true,
        });
      }
    }
  }

  deleteItemChecker(elements: HTMLElement[]) {
    let flag = false;
    for (const key in this.state) {
      const item = this.state[key];
      const htmlItem = elements.find((x) => x.id === item.id);

      if (!htmlItem) {
        flag = true;
        delete this.state[key];
      }
    }

    if (flag) {
      setTimeout(() => this.murriService.grid.refreshItems().layout(), 0);
    }
  }
}
