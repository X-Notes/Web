import { Component, OnInit, OnDestroy } from '@angular/core';
import { Theme } from 'src/app/shared/models/Theme';
import {
  PersonalizationService,
  sideBarCloseOpen,
} from 'src/app/shared/services/personalization.service';
import { Subject, Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { Select, Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ShortUser } from 'src/app/core/models/short-user';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { LabelsForFiltersNotes, LabelStore } from '../../labels/state/labels-state';
import { LoadLabels } from '../../labels/state/labels-actions';
import { AddNote, CancelAllSelectedLabels, UpdateSelectLabel } from '../state/notes-actions';
import { NoteStore } from '../state/notes-state';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
  animations: [sideBarCloseOpen],
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

  theme = Theme;

  public photoError = false;

  public labelsFilters: LabelsForFiltersNotes[] = [];

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    private router: Router,
  ) {}

  async ngOnInit() {
    this.store
      .select(AppStore.appLoaded)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (x: boolean) => {
        if (x) {
          await this.store.dispatch(new LoadLabels()).toPromise();

          this.store
            .select(LabelStore.all)
            .pipe(
              takeUntil(this.destroy),
              map((labels) => {
                return labels.map((label) => {
                  return {
                    label,
                    selected: this.labelsFilters.find((z) => z.label.id === label.id)?.selected,
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
        }
      });
    this.pService.newButtonSubject.pipe(takeUntil(this.destroy)).subscribe(() => this.newNote());
  }

  async newNote() {
    await this.store.dispatch(new AddNote()).toPromise();
    const notes = this.store.selectSnapshot(NoteStore.privateNotes);
    this.router.navigate([`notes/${notes[0].id}`]);
  }

  get labelsActive() {
    return this.labelsFilters.filter((z) => z.selected === true).length > 0;
  }

  cancelLabel() {
    this.labelsFilters.forEach((label) => {
      // eslint-disable-next-line no-param-reassign
      label.selected = false;
    });
    this.store.dispatch(new CancelAllSelectedLabels(true));
  }

  filterNotes(id: string) {
    const label = this.labelsFilters.find((z) => z.label.id === id);
    label.selected = !label.selected;
    this.store.dispatch(new UpdateSelectLabel(id));
  }

  cancelSideBar() {
    this.pService.stateSidebar = false;
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new CancelAllSelectedLabels(false));
  }

  changeSource() {
    this.photoError = true;
  }
}
