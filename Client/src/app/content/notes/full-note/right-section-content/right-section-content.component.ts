import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  deleteSmallNote,
  PersonalizationService,
  showHistory,
} from 'src/app/shared/services/personalization.service';
import { SmallNote } from '../../models/small-note.model';
import { NoteStore } from '../../state/notes-state';
import { NoteHistory } from '../models/history/note-history.model';
import { ApiNoteHistoryService } from '../services/api-note-history.service';
import { SidebarNotesService } from '../services/sidebar-notes.service';

@Component({
  selector: 'app-right-section-content',
  templateUrl: './right-section-content.component.html',
  styleUrls: ['./right-section-content.component.scss'],
  animations: [deleteSmallNote, showHistory],
  providers: [SidebarNotesService],
})
export class RightSectionContentComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() note: SmallNote;

  @Input() wrap: ElementRef;

  @Select(NoteStore.canEdit)
  public canEdit$: Observable<boolean>;

  @ViewChildren('relatedItem', { read: ElementRef }) refSideBarElements: QueryList<ElementRef>;

  histories: NoteHistory[];

  constructor(
    public pService: PersonalizationService,
    public sideBarService: SidebarNotesService,
    private apiHistory: ApiNoteHistoryService,
    private store: Store,
  ) {}

  ngOnDestroy(): void {}

  async ngOnInit() {
    const isCanEdit = this.store.selectSnapshot(NoteStore.canEdit);
    await this.sideBarService.initializeEntities(this.note.id, isCanEdit);
    const result = await this.apiHistory.getHistory(this.note.id).toPromise();
    if (result.success) {
      this.histories = result.data;
    }
  }

  ngAfterViewInit(): void {
    this.sideBarService.murriInitialise(this.refSideBarElements, this.note.id);
  }
}
