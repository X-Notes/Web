import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { SmallNote } from '../models/smallNote';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { LoadPrivateNotes, UnSelectAllNote, PositionNote } from '../state/notes-actions';
import { Order, OrderEntity } from 'src/app/shared/services/order.service';
import { take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UpdateColor } from '../state/updateColor';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { FontSize } from 'src/app/shared/enums/FontSize';

@Component({
  selector: 'app-privates',
  templateUrl: './privates.component.html',
  styleUrls: ['./privates.component.scss']
})
export class PrivatesComponent implements OnInit, OnDestroy {

  fontSize = FontSize;
  destroy = new Subject<void>();

  public notes: SmallNote[];

  constructor(public pService: PersonalizationService,
              private store: Store) { }


  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new UnSelectAllNote());
  }

  async ngOnInit() {

    this.store.select(UserStore.getTokenUpdated)
    .pipe(takeUntil(this.destroy))
    .subscribe(async (x: boolean) => {
      if (x) {
        await this.loadContent();
      }
    }
    );

  }

  async loadContent() {
    await this.store.dispatch(new LoadPrivateNotes()).toPromise();

    this.store.select(x => x.Notes.privateNotes).pipe(take(1))
      .subscribe(x => { this.notes = [...x].map(note => { note = { ...note }; return note; }); setTimeout(() => this.initMurri()); });

    this.store.select(x => x.Notes.updateColorEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.changeColorHandler(x));

    this.store.select(x => x.Notes.removeFromMurriEvent)
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.delete(x));

    this.store.select(x => x.Notes.notesAddingPrivate)
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.addToDom(x));
  }

  initMurri() {

    this.pService.gridSettings('.grid-item');

    this.pService.grid.on('dragEnd', async (item, event) => {
      console.log(item._element.id);
      const order: Order = {
        orderEntity: OrderEntity.Note,
        position: item.getGrid().getItems().indexOf(item) + 1,
        entityId: item._element.id
      };
      this.store.dispatch(new PositionNote(order, NoteType.Private));
    });
  }

  changeColorHandler(updateColor: UpdateColor[]) {
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

  addToDom(notes: SmallNote[]) {
    if (notes.length > 0) {
      this.notes = [...notes, ...this.notes];
      setTimeout(() => {
        const DOMnodes = document.getElementsByClassName('grid-item');
        for (let i = 0; i < notes.length; i++) {
          const el = DOMnodes[i];
          this.pService.grid.add(el, {index : 0, layout: true});
        }
      }, 0);
    }
  }
}
