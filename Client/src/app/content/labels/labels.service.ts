import { ElementRef, Injectable, OnDestroy, QueryList } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MurriService } from 'src/app/shared/services/murri.service';
import { Label } from './models/label.model';

@Injectable()
export class LabelsService implements OnDestroy {
  destroy = new Subject<void>();

  public labels: Label[] = [];

  public labelsState: Record<string, Label> = {};

  firstInitedMurri = false;

  constructor(private murriService: MurriService) {}

  ngOnDestroy(): void {
    console.log('destroy');
    this.destroy.next();
    this.destroy.complete();
  }

  murriInitialise(refElements: QueryList<ElementRef>, isDeleted: boolean) {
    refElements.changes.pipe(takeUntil(this.destroy)).subscribe(async (z) => {
      if (z.length === this.labels.length && this.labels.length !== 0 && !this.firstInitedMurri) {
        this.murriService.initMurriLabel(isDeleted);
        await this.murriService.setOpacityFlagAsync();
        this.firstInitedMurri = true;
      } else {
        const elements = refElements.toArray().map((item) => item.nativeElement as HTMLElement);
        this.newItemChecker(elements);
        this.deleteItemChecker(elements);
      }
    });
  }

  newItemChecker(elements: HTMLElement[]) {
    for (const el of elements) {
      if (!this.labelsState[el.id]) {
        this.labelsState[el.id] = this.labels.find((x) => x.id === el.id);
        this.murriService.grid.add(document.getElementById(el.id), {
          index: 0,
          layout: true,
        });
      }
    }
  }

  deleteItemChecker(elements: HTMLElement[]) {
    let flag = false;
    for (const key in this.labelsState) {
      const item = this.labelsState[key];
      const htmlItem = elements.find((x) => x.id === item.id);

      if (!htmlItem) {
        flag = true;
        delete this.labelsState[key];
      }
    }

    if (flag) {
      setTimeout(() => this.murriService.grid.refreshItems().layout(), 0);
    }
  }

  firstInit(labels: Label[]) {
    this.labels = [...labels].map((label) => ({ ...label }));
    this.labels.forEach((label) => (this.labelsState[label.id] = label));
  }
}
