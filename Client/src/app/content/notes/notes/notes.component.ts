import { Component, OnInit, OnDestroy, ViewChild, ElementRef, } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen } from 'src/app/shared/services/personalization.service';
import { Subject, Observable } from 'rxjs';
import { map, takeUntil, } from 'rxjs/operators';
import { Select, Store } from '@ngxs/store';
import { LabelsForFiltersNotes, LabelStore } from '../../labels/state/labels-state';
import { LoadLabels } from '../../labels/state/labels-actions';
import { AddNote, CancelAllSelectedLabels, UpdateSelectLabel } from '../state/notes-actions';
import { Router } from '@angular/router';
import { NoteStore } from '../state/notes-state';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ShortUser } from 'src/app/core/models/short-user';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { UpdateLabelEvent } from '../state/updateLabels';

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

  @ViewChild ('scrollMe', { static: true })
  public myScrollContainer: ElementRef;

  destroy = new Subject<void>();
  loaded = false;
  theme = Theme;
  public photoError = false;
  labelsActive = false;

  @Select(AppStore.spinnerActive)
  public spinnerActive$: Observable<boolean>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  public labelsFilters: LabelsForFiltersNotes[] = [];


  @Select(NoteStore.privateCount)
  public countPrivate: Observable<number>;

  @Select(NoteStore.sharedCount)
  public countShared: Observable<number>;

  @Select(NoteStore.deletedCount)
  public countDeleted: Observable<number>;

  @Select(NoteStore.archiveCount)
  public countArchive: Observable<number>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  constructor(public pService: PersonalizationService,
              private store: Store,
              private router: Router) { }

  async ngOnInit() {
    this.store.select(UserStore.getTokenUpdated)
    .pipe(takeUntil(this.destroy))
    .subscribe(async (x: boolean) => {
      if (x) {
        await this.store.dispatch(new LoadLabels()).toPromise();

        this.store.select(LabelStore.all)
        .pipe(takeUntil(this.destroy),
        map(labels => {
          return labels.map(label => {
            return {label, selected: this.labelsFilters.find(z => z.label.id === label.id)?.selected};
           });
        }))
        .subscribe(async (labels) => {
          this.labelsFilters = labels.sort((a, b) => (a.label.countNotes > b.label.countNotes) ? -1 : 1);
        });

        await this.pService.waitPreloading();
        this.loaded = true;

      }
    });
    this.pService.subject
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.newNote());

    this.pService.onResize();
  }


  async newNote() {
    await this.store.dispatch(new AddNote()).toPromise();
    const notes = this.store.selectSnapshot(NoteStore.privateNotes);
    this.router.navigate([`notes/${notes[0].id}`]);
  }

  cancelLabel() {
    this.labelsActive = false;
    this.labelsFilters.forEach(z => z.selected = false);
    this.store.dispatch(new CancelAllSelectedLabels(true));
  }

  filterNotes(id: number) {
    const label = this.labelsFilters.find(z => z.label.id === id);
    label.selected = !label.selected;
    this.labelsActive = this.labelsFilters.filter(z => z.selected === true).length > 0;
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

  changeSource(event) {
    this.photoError = true;
  }
}
