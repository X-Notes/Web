import { ElementRef } from '@angular/core';
import { SmallFolder } from 'src/app/content/folders/models/folder.model';
import { Label } from 'src/app/content/labels/models/label.model';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import { MurriService } from './murri.service';
import { PositionEntityModel } from 'src/app/content/notes/models/position-note.model';
import { BehaviorSubject, Subject } from 'rxjs';
import { bufferTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface MurriSyncResult {
  idsToAdd: string[];
}

export abstract class MurriEntityService<Entity extends Label | SmallNote | SmallFolder> {
  public entities: Entity[] = [];

  private state: Record<string, Entity> = {};

  private firstInitedMurri = false;

  private progressiveLoadOptions = {
    firstLoadCount: 5,
    stepCount: 1,
    renderInterval: 20,
  };

  onProgressiveAdding$ = new Subject<void>();

  onCancelRendering$ = new BehaviorSubject<boolean>(false);

  protected onDisplayItems$ = new BehaviorSubject<Entity>(null);

  isRendering = false;

  constructor(public murriService: MurriService) {
    this.onDisplayItems$
      .pipe(takeUntilDestroyed(), bufferTime(200))
      .subscribe((entities: Entity[]) => {
        if (!entities || entities.length === 0) return;
        setTimeout(() => entities.filter(x => x).forEach(x => x.isDisplay = true), 150);
      });
  }

  get isAnyEntityInLayout(): boolean {
    return this.entities.length > 0;
  }

  get getFirstInitedMurri(): boolean {
    return this.firstInitedMurri;
  }

  noExistIsState(id: string): boolean {
    return !this.state[id];
  }

  resetState(): void {
    this.state = {};
  }

  initState(): void {
    this.resetState();
    this.entities.forEach((ent) => (this.state[ent.id] = ent));
  }

  async synchronizeState(refElements: ElementRef[]): Promise<MurriSyncResult> {
    const elements = refElements.map((item) => item.nativeElement as HTMLElement);
    const res = this.newItemChecker(elements);
    await this.deleteItemChecker(elements);
    if(!this.isRendering) {
      this.syncPositions();
    }
    return { idsToAdd: res };
  }

  setFirstInitedMurri(flag = true): void {
    this.firstInitedMurri = flag;
  }

  async resetLayoutAsync() {
    this.onCancelRendering$.next(true);
    await this.murriService.muuriDestroyAsync();
    this.setFirstInitedMurri(false);
  }

  needFirstInit(): boolean {
    return !this.firstInitedMurri;
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
      this.entities = this.entities.filter((x) => !ids.some((q) => q === x.id));
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
    const item = this.murriService.getItems().find((x) => x._element.id === id);
    if (item) {
      this.murriService.removeElements([item], false);
    }
  }

  private newItemChecker(elements: HTMLElement[]): string[] {
    const resIds: string[] = [];
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (!this.state[el.id]) {
        const ent = this.entities.find((x) => x.id === el.id);
        if (ent) {
          this.state[el.id] = ent;
          this.murriService.addElement(el, i, true);
          resIds.push(el.id);
        }
      }
    }
    return resIds;
  }

  protected initContentProgressively(
    items: Entity[],
    onRenderCallback?: () => void,
  ): void {
    items.forEach(x => x.isDisplay = false);
    this.isRendering = true;
    this.onCancelRendering$.next(false);
    let end = this.progressiveLoadOptions.firstLoadCount;
    if (end > items.length) {
      end = items.length;
    }

    const itemsToInit = items.slice(0, end);
    this.entities = itemsToInit;

    this.onProgressiveAdding$.next();

    if (this.entities.length === items.length) {
      if (onRenderCallback) {
        onRenderCallback();
      }
      this.isRendering = false;
      return;
    }

    const interval = setInterval(() => {

      if (this.onCancelRendering$.getValue()) {
        clearInterval(interval);
        this.onCancelRendering$.next(false);
      }

      const start = this.entities.length;
      end = start + this.progressiveLoadOptions.stepCount;

      if (end > items.length) {
        end = items.length;
      }

      const itemsToPush = items.slice(start, end);
      this.entities.push(...itemsToPush);

      this.onProgressiveAdding$.next();
      if (start >= items.length) {
        this.isRendering = false;
        if (onRenderCallback) {
          onRenderCallback();
        }
        clearInterval(interval);
      }
    }, this.progressiveLoadOptions.renderInterval);
  }

  abstract syncPositions(): void;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get isNeedUpdatePositions(): boolean {
    const positions = this.murriService.getPositions();
    if (positions.length === 0) return false;
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
