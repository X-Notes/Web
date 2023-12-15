import { Component, OnInit, OnDestroy } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Subject, Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { Select, Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ShortUser } from 'src/app/core/models/user/short-user.model';
import { LabelsForFiltersNotes, LabelStore } from '../../labels/state/labels-state';
import { LoadLabels } from '../../labels/state/labels-actions';
import { CreateNote, CancelAllSelectedLabels, UpdateSelectLabel } from '../state/notes-actions';
import { NoteStore } from '../state/notes-state';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
})
export class NotesComponent implements OnInit, OnDestroy {
  @Select(NoteStore.privateCount)
  public countPrivate: Observable<number>;

  @Select(NoteStore.sharedCount)
  public countShared: Observable<number>;

  @Select(UserStore.getUserBackground)
  public userBackground$: Observable<string>;

  @Select(NoteStore.deletedCount)
  public countDeleted: Observable<number>;

  @Select(NoteStore.archiveCount)
  public countArchive: Observable<number>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  destroy = new Subject<void>();

  loaded = false;

  public labelsFilters: LabelsForFiltersNotes[] = [];

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    private router: Router,
  ) {}

  get labelsActive() {
    return this.labelsFilters.filter((q) => q.selected === true).length > 0;
  }

  async ngOnInit() {
    this.store.dispatch(new LoadLabels());

    this.store
      .select(LabelStore.noDeleted)
      .pipe(
        takeUntil(this.destroy),
        map((labels) => {
          return labels.map((label) => {
            return {
              label,
              selected: this.labelsFilters.find((q) => q.label.id === label.id)?.selected,
            };
          });
        }),
      )
      .subscribe(async (labels) => {
        this.labelsFilters = labels.sort((a, b) =>
          a.label.countNotes > b.label.countNotes ? -1 : 1,
        );
      });

    await this.pService.waitPreloading();
    this.loaded = true;

    this.pService.newButtonSubject
      .pipe(takeUntil(this.destroy))
      .subscribe(() => this.store.dispatch(new CreateNote(true)));
  }

  cancelLabel() {
    this.labelsFilters.forEach((label) => {
      // eslint-disable-next-line no-param-reassign
      label.selected = false;
    });
    setTimeout(() => this.store.dispatch(new CancelAllSelectedLabels(true)), 150);
  }

  filterNotes(id: string) {
    const label = this.labelsFilters.find((q) => q.label.id === id);
    label.selected = !label.selected;
    setTimeout(() => this.store.dispatch(new UpdateSelectLabel(id)), 150);
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new CancelAllSelectedLabels(false));
  }
}
