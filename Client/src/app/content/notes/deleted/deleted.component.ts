import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { SmallNote } from '../models/smallNote';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Store } from '@ngxs/store';
import { UnSelectAllNote, LoadDeletedNotes, PositionNote } from '../state/notes-actions';
import { take, takeUntil } from 'rxjs/operators';
import { Order, OrderEntity } from 'src/app/shared/services/order.service';
import { UpdateColorNote } from '../state/updateColor';
import { NoteType } from 'src/app/shared/enums/NoteTypes';

@Component({
  selector: 'app-deleted',
  templateUrl: './deleted.component.html',
  styleUrls: ['./deleted.component.scss']
})
export class DeletedComponent implements OnInit, OnDestroy {

  destroy = new Subject<void>();

  public notes: SmallNote[];

  constructor(public pService: PersonalizationService,
              private store: Store) { }

  async ngOnInit() {
    await this.store.dispatch(new LoadDeletedNotes()).toPromise();

    this.store.select(x => x.Notes.deletedNotes).pipe(take(1))
      .subscribe(x => { this.notes = [...x].map(note => { note = { ...note }; return note; }); setTimeout(() => this.initMurri()); });

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
      this.store.dispatch(new PositionNote(order, NoteType.Deleted));
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
