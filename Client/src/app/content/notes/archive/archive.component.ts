import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { SmallNote } from '../models/smallNote';
import { Store } from '@ngxs/store';
import { LoadArchiveNotes, UnSelectAllNote } from '../state/notes-actions';
import { take, takeUntil } from 'rxjs/operators';
import { OrderEntity, Order } from 'src/app/shared/services/order.service';
import { UpdateColorNote } from '../state/updateColor';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss']
})
export class ArchiveComponent implements OnInit, OnDestroy {

  destroy = new Subject<void>();

  public notes: SmallNote[];

  constructor(public pService: PersonalizationService,
              private store: Store) { }

  async ngOnInit() {
    await this.store.dispatch(new LoadArchiveNotes()).toPromise();

    this.store.select(x => x.Notes.archiveNotes).pipe(take(1))
    .subscribe(x => { this.notes = [...x].map(note => { note = {...note}; return note; }); setTimeout(() => this.initMurri()); });

    this.store.select(x => x.Notes.updateColorEvent)
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.changeColorHandler(x));

    this.store.select(x => x.Notes.removeFromMurriEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.delete(x));
  }

  initMurri() {
    this.pService.gridSettings();
    this.pService.grid.on('dragEnd', async (item, event) => {
      console.log(item._element.id);
      const order: Order = {
        orderEntity: OrderEntity.Note,
        position: item.getGrid().getItems().indexOf(item) + 1,
        entityId: item._element.id
      };
      });
  }

  changeColorHandler(updateColor: UpdateColorNote[]) {
    for (const update of updateColor) {
      this.notes.find(x => x.id === update.id).color = update.color;
    }
  }

  delete(ids: string[]) {
    if (ids.length > 0) {
      this.notes = this.notes.filter(x => ids.indexOf(x.id) !== -1 ? false : true);
      setTimeout(() => this.pService.grid.refreshItems().layout(), 0);
    }
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new UnSelectAllNote());
  }
}
