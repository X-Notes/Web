import { ElementRef, QueryList } from '@angular/core';
import { SmallFolder } from 'src/app/content/folders/models/folder.model';
import { Label } from 'src/app/content/labels/models/label.model';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import { MurriService } from './murri.service';
import { PositionEntityModel } from 'src/app/content/notes/models/position-note.model';

export abstract class MurriEntityService<Entity extends Label | SmallNote | SmallFolder> {
  public entities: Entity[] = [];

  private state: Record<string, Entity> = {};

  private firstInitedMurri = false;

  constructor(public murriService: MurriService) {}

  get isAnyEntityInLayout(): boolean {
    return this.entities.length > 0;
  }

  get getFirstInitedMurri(): boolean {
    return this.firstInitedMurri;
  }

  noExistIsState(id: string): boolean {
    return !this.state[id];
  }

  initState() {
    // eslint-disable-next-line no-return-assign
    this.entities.forEach((ent) => (this.state[ent.id] = ent));
  }

  async synchronizeState(refElements: QueryList<ElementRef>, isAddToEnd: boolean) {
    if (this.firstInitedMurri) {
      const elements = refElements.toArray().map((item) => item.nativeElement as HTMLElement);
      this.newItemChecker(elements, isAddToEnd);
      await this.deleteItemChecker(elements);
    }
    this.syncPositions();
  }

  async setInitMurriFlagShowLayout() {
    await this.murriService.setOpacityFlagAsync();
    this.firstInitedMurri = true;
  }

  destroyLayout() {
    this.murriService.flagForOpacity = false;
    this.murriService.muuriDestroy();
  }

  getIsFirstInit(q: any): boolean {
    return (
      q.length === this.entities.length && this.entities.length !== 0 && !this.firstInitedMurri
    );
  }

  addToDom(ents: Entity[]): boolean {
    if (ents && ents.length > 0) {
      const m = ents.filter((x) => this.noExistIsState(x.id)).map((x) => ({ ...x }));
      this.entities.unshift(...m);
      return true;
    }
    return false;
  }

  deleteFromDom(ids: string[]) {
    if (ids.length > 0) {
      this.entities = this.entities.filter((x) => !ids.some((z) => z === x.id));
    }
  }

  private async deleteItemChecker(elements: HTMLElement[]): Promise<boolean> {
    let isHasUpdates = false;
    // eslint-disable-next-line guard-for-in
    for (const key in this.state) {
      const item = this.state[key];
      const htmlItem = elements.find((x) => x.id === item.id);
      if (!htmlItem) {
        isHasUpdates = true;
        delete this.state[key];
        this.removeFromGrid(item.id);
      }
    }
    if (isHasUpdates) {
      await this.murriService.refreshLayoutAsync();
    }
    return isHasUpdates;
  }

  private removeFromGrid(id: string): void {
    // eslint-disable-next-line no-underscore-dangle
    const item = this.murriService.grid.getItems().find((x) => x._element.id === id);
    if (item) {
      this.murriService.grid.remove([item], { removeElements: false });
    }
  }

  private newItemChecker(elements: HTMLElement[], isAddToEnd: boolean): boolean {
    let isHasUpdates = false;
    for (const el of elements) {
      if (!this.state[el.id]) {
        this.state[el.id] = this.entities.find((x) => x.id === el.id);
        this.murriService.grid.add(el, {
          index: isAddToEnd ? -1 : 0,
          layout: true,
        });
        isHasUpdates = true;
      }
    }
    return isHasUpdates;
  }

  abstract syncPositions();

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get isNeedUpdatePositions(): boolean {
    const positions = this.murriService.getPositions();
    const statePositions = this.entities.map(
      (x) => ({ entityId: x.id, position: x.order } as PositionEntityModel),
    );
    if (positions.length !== statePositions.length) return true;
    const same = positions.every(
      (x, i) =>
        x.entityId === statePositions[i].entityId && x.position === statePositions[i].position,
    );
    return !same;
  }
}
