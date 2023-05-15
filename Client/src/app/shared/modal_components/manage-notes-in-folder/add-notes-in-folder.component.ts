/* eslint-disable no-return-assign */
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
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ApiFullFolderService } from 'src/app/content/folders/full-folder/services/api-full-folder.service';
import { FolderStore } from 'src/app/content/folders/state/folders-state';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import { UnSelectAllNote } from 'src/app/content/notes/state/notes-actions';
import { searchDelay } from 'src/app/core/defaults/bounceDelay';
import { ShortUser } from 'src/app/core/models/user/short-user.model';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { EntitiesSizeENUM } from '../../enums/font-size.enum';
import { MurriService } from '../../services/murri.service';
import { PersonalizationService } from '../../services/personalization.service';
import { BaseSearchNotesTypes } from '../general-components/base-search-notes-types';
import { EnumConverterService } from '../../services/enum-converter.service';
import { SelectionOption } from '../../custom-components/select-component/entities/select-option';
import { SearchNotesTypesEnum } from '../general-components/enums/search-notes-types.enum';

@Component({
  selector: 'app-add-notes-in-folder',
  templateUrl: './add-notes-in-folder.component.html',
  styleUrls: ['./add-notes-in-folder.component.scss'],
  providers: [MurriService],
})
export class AddNotesInFolderComponent
  extends BaseSearchNotesTypes
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  destroy = new Subject<void>();

  fontSize = EntitiesSizeENUM;

  optionsState: SelectionOption[];

  constructor(
    murriService: MurriService,
    public pService: PersonalizationService,
    private apiFullFolder: ApiFullFolderService,
    public dialogRef: MatDialogRef<AddNotesInFolderComponent>,
    private store: Store,
    private enumConverter: EnumConverterService,
  ) {
    super(murriService);
  }

  get selectedNotesChips() {
    return this.notes.filter((x) => x.isSelected);
  }

  get options(): SelectionOption[] {
    if (this.optionsState) {
      return this.optionsState;
    }
    this.optionsState = [
      SearchNotesTypesEnum.all,
      SearchNotesTypesEnum.archive,
      SearchNotesTypesEnum.personal,
      SearchNotesTypesEnum.shared,
    ].map((x) =>
      this.enumConverter.convertEnumToSelectionOption(SearchNotesTypesEnum, x, 'subMenu.'),
    );
    return this.optionsState;
  }

  ngOnInit(): void {
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
    const folderId = this.store.selectSnapshot(FolderStore.full).id;
    this.searchChanged$
      .pipe(debounceTime(searchDelay), distinctUntilChanged(), takeUntil(this.destroy))
      .subscribe(async (str) => {
        if (!this.loaded) return;
        this.pService.setSpinnerState(true);
        await this.murriService.destroyGridAsync();

        const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
        this.notes = await this.apiFullFolder.getAllPreviewNotes(folderId, str, pr).toPromise();
        this.viewNotes = [...this.notes];
        this.pService.setSpinnerState(false);
        await this.murriService.initMurriPreviewDialogNoteAsync();
        await this.murriService.setOpacityFlagAsync(0);
        this.defaultValue = SearchNotesTypesEnum.all;
      });
  }

  async loadContent() {
    const folderId = this.store.selectSnapshot(FolderStore.full).id;
    const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
    this.notes = await this.apiFullFolder.getAllPreviewNotes(folderId, '', pr).toPromise();
    this.viewNotes = [...this.notes];

    await this.pService.waitPreloading();
    this.pService.setSpinnerState(false);
    this.loaded = true;
  }

  async ngAfterViewInit(): Promise<void> {
    this.refElements.changes.pipe(takeUntil(this.destroy)).subscribe(async (q) => {
      if (q.length === this.viewNotes.length && !this.firstInitedMurri) {
        this.murriService.initMurriPreviewDialogNote();
        await this.murriService.setOpacityFlagAsync();
        this.firstInitedMurri = true;
      }
    });
  }

  // eslint-disable-next-line no-param-reassign
  highlightNote = (note: SmallNote) => (note.isSelected = !note.isSelected);

  // eslint-disable-next-line no-param-reassign
  unSelectNote = (note: SmallNote) => (note.isSelected = false);

  ngOnDestroy(): void {
    this.murriService.flagForOpacity = false;
    this.murriService.muuriDestroy();
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new UnSelectAllNote());
  }
}
