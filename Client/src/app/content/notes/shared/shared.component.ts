import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Store } from '@ngxs/store';
import { UnSelectAllNote, LoadSharedNotes, LoadAllExceptNotes } from '../state/notes-actions';
import { take, takeUntil } from 'rxjs/operators';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { SpinnerChangeStatus, UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { NoteStore } from '../state/notes-state';
import { FontSize } from 'src/app/shared/enums/FontSize';
import { MurriService } from 'src/app/shared/services/murri.service';
import { NotesService } from '../notes.service';

@Component({
  selector: 'app-shared',
  templateUrl: './shared.component.html',
  styleUrls: ['./shared.component.scss'],
  providers: [NotesService]
})
export class SharedComponent implements OnInit, OnDestroy {

  fontSize = FontSize;
  destroy = new Subject<void>();

  constructor(public pService: PersonalizationService,
              private store: Store,
              public murriService: MurriService,
              public noteService: NotesService
  ) { }

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.NoteShared)).toPromise();
    await this.store.dispatch(new SpinnerChangeStatus(true)).toPromise();
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
    await this.store.dispatch(new LoadSharedNotes()).toPromise();

    this.store.dispatch(new LoadAllExceptNotes(NoteType.Shared));

    this.store.select(NoteStore.sharedNotes).pipe(take(1))
    .subscribe(async (x) => {
      this.noteService.firstInit(x);
      const active =  await this.pService.initPromise();
      await this.store.dispatch(new SpinnerChangeStatus(active)).toPromise()
      .then(z => { this.murriService.initMurriNote(EntityType.NoteShared); });
     });

  }


  ngOnDestroy(): void {
    this.murriService.flagForOpacity = false;
    this.murriService.muuriDestroy();
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new UnSelectAllNote());
  }


}
