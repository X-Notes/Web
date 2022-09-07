/* eslint-disable no-param-reassign */
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ApiRelatedNotesService } from 'src/app/content/notes/api-related-notes.service';
import { PreviewNote } from 'src/app/content/notes/models/preview-note.model';
import { UnSelectAllNote } from 'src/app/content/notes/state/notes-actions';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { searchDelay } from 'src/app/core/defaults/bounceDelay';
import { BillingPlanId } from 'src/app/core/models/billing/billing-plan-id.enum';
import { ShortUser } from 'src/app/core/models/user/short-user.model';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { EntitiesSizeENUM } from '../../enums/font-size.enum';
import { MurriService } from '../../services/murri.service';
import { PersonalizationService, showDropdown } from '../../services/personalization.service';
import { SnackbarService } from '../../services/snackbar/snackbar.service';
import { BaseSearchNotesTypes } from '../general-components/base-search-notes-types';

@Component({
  selector: 'app-open-inner-side',
  templateUrl: './open-inner-side.component.html',
  styleUrls: ['./open-inner-side.component.scss'],
  animations: [showDropdown],
  providers: [MurriService],
})
export class OpenInnerSideComponent
  extends BaseSearchNotesTypes
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  fontSize = EntitiesSizeENUM;

  destroy = new Subject<void>();

  constructor(
    private store: Store,
    murriService: MurriService,
    public pService: PersonalizationService,
    public dialogRef: MatDialogRef<OpenInnerSideComponent>,
    private apiRelatedNotes: ApiRelatedNotesService,
    private snackbarService: SnackbarService,
    private translate: TranslateService,
  ) {
    super(murriService);
  }

  get maxCountOfNotes(): number {
    const plan = this.store.selectSnapshot(UserStore.getUserBillingPlan);
    if (plan === BillingPlanId.Standart) {
      return 5;
    }
    return 30;
  }

  get isMaxNotesSelected(): boolean {
    return this.selectedNotesChips.length >= this.maxCountOfNotes;
  }

  get selectedNotesChips() {
    return this.notes.filter((x) => x.isSelected);
  }

  async ngAfterViewInit(): Promise<void> {
    this.refElements.changes.pipe(takeUntil(this.destroy)).subscribe(async (z) => {
      if (z.length === this.viewNotes.length && !this.firstInitedMurri) {
        this.murriService.initMurriPreviewDialogNote();
        await this.murriService.setOpacityFlagAsync();
        this.firstInitedMurri = true;
      }
    });
  }

  ngOnInit() {
    this.initSearch();
    this.pService.setSpinnerState(true);
    this.dialogRef
      .afterOpened()
      .pipe(takeUntil(this.destroy))
      .subscribe(async () => {
        this.loadContent();
      });
  }

  initSearch() {
    const noteId = this.store.selectSnapshot(NoteStore.oneFull).id;
    this.searchChanged$
      .pipe(debounceTime(searchDelay), distinctUntilChanged(), takeUntil(this.destroy))
      .subscribe(async (str) => {
        if (!this.loaded) return;
        this.pService.setSpinnerState(true);
        await this.murriService.destroyGridAsync();

        const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
        this.notes = await this.apiRelatedNotes.getAllPreviewNotes(noteId, str, pr).toPromise();
        this.viewNotes = [...this.notes];
        this.pService.setSpinnerState(false);
        await this.murriService.initMurriPreviewDialogNoteAsync();
        await this.murriService.setOpacityFlagAsync(0);
        this.selectValue = this.selectTypes[0];
      });
  }

  async loadContent() {
    const noteId = this.store.selectSnapshot(NoteStore.oneFull).id;
    const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
    this.notes = await this.apiRelatedNotes.getAllPreviewNotes(noteId, '', pr).toPromise();
    this.viewNotes = [...this.notes];

    await this.pService.waitPreloading();
    this.pService.setSpinnerState(false);
    this.loaded = true;
  }

  // eslint-disable-next-line class-methods-use-this
  highlightNote(note: PreviewNote): void {
    if (this.selectedNotesChips.length >= this.maxCountOfNotes && !note.isSelected) {
      const message = this.translate.instant('snackBar.subscriptionMaxNotesError', {
        count: this.maxCountOfNotes,
      });
      this.snackbarService.openSnackBar(message);
      return;
    }
    note.isSelected = !note.isSelected;
  }

  // eslint-disable-next-line class-methods-use-this
  unSelectNote(note: PreviewNote) {
    note.isSelected = false;
  }

  ngOnDestroy(): void {
    this.murriService.flagForOpacity = false;
    this.murriService.muuriDestroy();
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new UnSelectAllNote());
  }

  close() {
    this.dialogRef.close(this.selectedNotesChips);
  }
}
