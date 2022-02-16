import { ElementRef, Injectable, OnDestroy, QueryList } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IMurriEntityService } from 'src/app/shared/services/murri-entity.contract';
import { MurriEntityService } from 'src/app/shared/services/murri-entity.service';
import { MurriService } from 'src/app/shared/services/murri.service';
import { Label } from './models/label.model';

/** Injection only in component */
@Injectable()
export class LabelsService
  extends MurriEntityService<Label>
  implements OnDestroy, IMurriEntityService<Label, boolean> {
  destroy = new Subject<void>();

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(murriService: MurriService) {
    super(murriService);
  }

  ngOnDestroy(): void {
    console.log('label destroy');
    super.destroyLayout();
    this.destroy.next();
    this.destroy.complete();
  }

  murriInitialise(refElements: QueryList<ElementRef>, isDeleted: boolean) {
    refElements.changes.pipe(takeUntil(this.destroy)).subscribe(async (z) => {
      if (this.getIsFirstInit(z)) {
        this.murriService.initMurriLabel(isDeleted);
        await this.setInitMurriFlagShowLayout();
      }
      await this.synchronizeState(refElements, false);
    });
  }

  async initializeEntities(labels: Label[]) {
    this.entities = [...labels].map((label) => ({ ...label }));
    super.initState();
  }
}
