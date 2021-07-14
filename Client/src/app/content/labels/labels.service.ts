import { ElementRef, Injectable, OnDestroy, QueryList } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MurriEntityService } from 'src/app/shared/services/murri-entity.service';
import { MurriService } from 'src/app/shared/services/murri.service';
import { Label } from './models/label.model';

@Injectable()
export class LabelsService extends MurriEntityService<Label> implements OnDestroy {
  destroy = new Subject<void>();

  constructor(murriService: MurriService) {
    super(murriService);
  }

  ngOnDestroy(): void {
    console.log('destroy');
    this.destroy.next();
    this.destroy.complete();
  }

  murriInitialise(refElements: QueryList<ElementRef>, isDeleted: boolean) {
    refElements.changes.pipe(takeUntil(this.destroy)).subscribe(async (z) => {
      if (
        z.length === this.entities.length &&
        this.entities.length !== 0 &&
        !this.firstInitedMurri
      ) {
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

  firstInit(labels: Label[]) {
    this.entities = [...labels].map((label) => ({ ...label }));
    this.entities.forEach((label) => (this.state[label.id] = label));
  }
}
