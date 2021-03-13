import { ElementRef, Injectable, OnDestroy, QueryList } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MurriService } from 'src/app/shared/services/murri.service';
import { Label } from './models/label';

@Injectable()
export class LabelsService implements OnDestroy {
  destroy = new Subject<void>();

  public allLabels: Label[] = [];

  public labels: Label[] = [];

  firstInitedMurri = false;

  constructor(private murriService: MurriService) {}

  ngOnDestroy(): void {
    console.log('destroy');
    this.destroy.next();
    this.destroy.complete();
  }

  murriInitialise(refElements: QueryList<ElementRef>, isDeleted: boolean) {
    refElements.changes.pipe(takeUntil(this.destroy)).subscribe(async (z) => {
      if (z.length === this.labels.length && !this.firstInitedMurri) {
        this.murriService.initMurriLabel(isDeleted);
        await this.murriService.setOpacityTrueAsync();
        this.firstInitedMurri = true;
      }
    });
  }

  firstInit(labels: Label[]) {
    this.allLabels = [...labels].map((label) => {
      label = { ...label };
      return label;
    });
    this.labels = this.allLabels;
  }
}
