import { ElementRef, Injectable, OnDestroy, QueryList } from '@angular/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MurriEntityService } from 'src/app/shared/services/murri-entity.service';
import { MurriService } from 'src/app/shared/services/murri.service';
import { Label } from './models/label.model';
import { AddToDomLabels, UpdatePositionsLabels } from './state/labels-actions';
import { LabelStore } from './state/labels-state';

/** Injection only in component */
@Injectable()
export class LabelsService extends MurriEntityService<Label> implements OnDestroy {
  destroy = new Subject<void>();

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(murriService: MurriService, private store: Store) {
    super(murriService);

    this.store
      .select(LabelStore.labelsAddingToDOM)
      .pipe(takeUntil(this.destroy))
      .subscribe((labels) => {
        if (labels?.length > 0) {
          this.addToDom(labels);
          this.store.dispatch(new AddToDomLabels([]));
        }
      });
  }

  ngOnDestroy(): void {
    console.log('label destroy');
    super.destroyLayout();
    this.destroy.next();
    this.destroy.complete();
  }

  murriInitialise(refElements: QueryList<ElementRef>) {
    refElements.changes.pipe(takeUntil(this.destroy)).subscribe(async (q) => {
      if (this.getIsFirstInit(q)) {
        this.murriService.initMurriLabel();
        await this.setInitMurriFlagShowLayout();
      }
      await this.synchronizeState(refElements, false);
    });
  }

  syncPositions(): void {
    if (!this.isNeedUpdatePositions) return;
    const positions = this.murriService.getPositions();
    this.store.dispatch(new UpdatePositionsLabels(positions));
  }

  async initializeEntities(labels: Label[]) {
    this.entities = [...labels].map((label) => ({ ...label }));
    super.initState();
  }
}
