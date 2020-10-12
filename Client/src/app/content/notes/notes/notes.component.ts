import { Component, OnInit, OnDestroy, } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen } from 'src/app/shared/services/personalization.service';
import { Subject, Observable } from 'rxjs';
import { takeUntil, take, } from 'rxjs/operators';
import { Select, Store } from '@ngxs/store';
import { LabelStore } from '../../labels/state/labels-state';
import { Label } from '../../labels/models/label';
import { LoadLabels } from '../../labels/state/labels-actions';
import { AddNote, LoadAllExceptNotes } from '../state/notes-actions';
import { Router } from '@angular/router';
import { NoteStore } from '../state/notes-state';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { NoteType } from 'src/app/shared/enums/NoteTypes';

export enum subMenu {
  All = 'all',
  Shared = 'shared',
  Locked = 'locked',
  Archive = 'archive',
  Bin = 'bin'
}


@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
  animations: [ sideBarCloseOpen ]
})

export class NotesComponent implements OnInit, OnDestroy {

  destroy = new Subject<void>();

  theme = Theme;

  labelsActive: number[] = [];
  actives = new Map<number, boolean>();

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  @Select(LabelStore.all)
  public labels$: Observable<Label[]>;


  @Select(NoteStore.privateCount)
  public countPrivate: Observable<number>;

  @Select(NoteStore.sharedCount)
  public countShared: Observable<number>;

  @Select(NoteStore.deletedCount)
  public countDeleted: Observable<number>;

  @Select(NoteStore.archiveCount)
  public countArchive: Observable<number>;

  constructor(public pService: PersonalizationService,
              private store: Store,
              private router: Router) { }

  async ngOnInit() {
    this.store.select(UserStore.getTokenUpdated)
    .pipe(takeUntil(this.destroy))
    .subscribe(async (x: boolean) => {
      if (x) {
        this.store.dispatch(new LoadLabels());
      }
    });

    this.pService.subject
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.newNote());

    this.pService.onResize();
  }

  async newNote() {
    await this.store.dispatch(new AddNote()).toPromise();
    this.store.select(state => state.Notes.privateNotes).pipe(take(1)).subscribe(x => this.router.navigate([`notes/${x[0].id}`]));
  }

  cancelLabel() {
    this.labelsActive = [];
    this.actives = new Map();
  }

  cancelAdd(id: number) {
    const flag = (this.actives.get(id) === undefined) || (this.actives.get(id) === false) ? true : false;
    this.actives.set(id, flag);
    if (flag) {
      this.labelsActive.push(id);
    } else {
      this.labelsActive = this.labelsActive.filter(x => x !== id);
    }
  }

  cancelSideBar() {
    this.pService.stateSidebar = false;
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
