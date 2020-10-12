import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { SmallNote } from '../models/smallNote';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { LoadPrivateNotes, UnSelectAllNote, PositionNote, LoadAllExceptNotes } from '../state/notes-actions';
import { Order, OrderEntity } from 'src/app/shared/services/order.service';
import { take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UpdateColor } from '../state/updateColor';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { NoteStore } from '../state/notes-state';
import { FontSize } from 'src/app/shared/enums/FontSize';
import { MurriService } from 'src/app/shared/services/murri.service';
import { NotesService } from '../notes.service';

@Component({
  selector: 'app-privates',
  templateUrl: './privates.component.html',
  styleUrls: ['./privates.component.scss'],
  providers: [MurriService]
})
export class PrivatesComponent implements OnInit, OnDestroy {

  fontSize = FontSize;
  destroy = new Subject<void>();
  constructor(public pService: PersonalizationService,
              private store: Store,
              public murriService: MurriService,
              public noteService: NotesService) { }


  async ngOnInit() {

    this.murriService.flagForOpacity = false;

    await this.store.dispatch(new UpdateRoute(EntityType.NotePrivate)).toPromise();

    this.store.select(UserStore.getTokenUpdated)
    .pipe(takeUntil(this.destroy))
    .subscribe(async (x: boolean) => {
      if (x) {
        setTimeout(async () => this.loadContent(), 5000);
      }
    }
    );

  }

  async loadContent() {
    await this.store.dispatch(new LoadPrivateNotes()).toPromise();

    this.store.dispatch(new LoadAllExceptNotes(NoteType.Private));

    this.store.select(NoteStore.privateNotes).pipe(take(1))
      .subscribe(x => { this.noteService.notes = [...x].map(note => { note = { ...note }; return note; });
                        setTimeout(() => {
                          this.murriService.initMurriNote(EntityType.NotePrivate);
                        }); });

    this.store.select(NoteStore.notesAddingPrivate)
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.noteService.addToDom(x));
  }


  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new UnSelectAllNote());
  }
}
