import { ElementRef, QueryList } from '@angular/core';
import { SmallFolder } from 'src/app/content/folders/models/folder.model';
import { Label } from 'src/app/content/labels/models/label.model';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import { MurriService } from './murri.service';

export class MurriEntityService<Entity extends Label | SmallNote | SmallFolder> {
  public entities: Entity[] = [];

  private state: Record<string, Entity> = {};

  private firstInitedMurri = false;

  constructor(protected murriService: MurriService) {}

  initState() {
    this.entities.forEach((ent) => (this.state[ent.id] = ent));
  }

  async synchronizeState(refElements: QueryList<ElementRef>) {
    if (this.firstInitedMurri) {
      const elements = refElements.toArray().map((item) => item.nativeElement as HTMLElement);
      this.newItemChecker(elements);
      await this.deleteItemChecker(elements);
    }
  }

  async setInitMurriFlagShowLayout() {
    await this.murriService.setOpacityFlagAsync();
    this.firstInitedMurri = true;
  }

  async destroyGridAsync(wait: number = 150) {
    await this.murriService.setOpacityFlagAsync(0, false);
    await this.murriService.wait(wait);
    this.murriService.grid.destroy();
  }

  private newItemChecker(elements: HTMLElement[]) {
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

  getIsFirstInit(z: any): boolean {
    return (
      z.length === this.entities.length && this.entities.length !== 0 && !this.firstInitedMurri
    );
  }

  private async deleteItemChecker(elements: HTMLElement[]) {
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
      await this.murriService.refreshLayoutAsync();
    }
  }

  addToDom(ents: Entity[]) {
    if (ents.length > 0) {
      this.entities = [...ents.map((ent) => ({ ...ent })).reverse(), ...this.entities];
    }
  }

  deleteFromDom(ids: string[]) {
    if (ids.length > 0) {
      this.entities = this.entities.filter((x) => !ids.some((z) => z === x.id));
    }
  }
}
