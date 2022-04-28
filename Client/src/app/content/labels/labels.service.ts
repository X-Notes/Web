import { ElementRef, Injectable, OnDestroy, QueryList } from '@angular/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MurriEntityService } from 'src/app/shared/services/murri-entity.service';
import { MurriService } from 'src/app/shared/services/murri.service';
import { Label } from './models/label.model';
import { UpdatePositionsLabels } from './state/labels-actions';

/** Injection only in component */
@Injectable()
export class LabelsService extends MurriEntityService<Label> implements OnDestroy {
  destroy = new Subject<void>();

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(murriService: MurriService, private store: Store) {
    super(murriService);
  }

  ngOnDestroy(): void {
    console.log('label destroy');
    super.destroyLayout();
    this.destroy.next();
    this.destroy.complete();
  }

  murriInitialise(refElements: QueryList<ElementRef>) {
    refElements.changes.pipe(takeUntil(this.destroy)).subscribe(async (z) => {
      if (this.getIsFirstInit(z)) {
        this.murriService.initMurriLabel();
        await this.setInitMurriFlagShowLayout();
      }
      await this.synchronizeState(refElements, false);
    });
  }

  updatePositions(): void {
    this.store.dispatch(new UpdatePositionsLabels(this.murriService.getPositions()));
  }

  async initializeEntities(labels: Label[]) {
    this.entities = [...labels].map((label) => ({ ...label }));
    super.initState();
  }
}
