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
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
  @Input() note$: Observable<SmallNote>;

  @Input() noteId: string;

  @Input() wrap: ElementRef;

  @Select(NoteStore.canEdit)
  public canEdit$: Observable<boolean>;

  @ViewChildren('relatedItem', { read: ElementRef }) refSideBarElements: QueryList<ElementRef>;

  histories: NoteHistory[];

  destroy = new Subject<void>();

  constructor(
    public pService: PersonalizationService,
    public sideBarService: SidebarNotesService,
    private apiHistory: ApiNoteHistoryService,
    private store: Store,
  ) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  async ngOnInit() {
    this.note$.pipe(takeUntil(this.destroy)).subscribe(async (note) => {
      if (note) {
        if (this.sideBarService.getFirstInitedMurri) {
          await this.sideBarService.murriService.destroyGridAsync();
          await this.loadData(note.id);
          await this.sideBarService.murriService.initSidebarNotesAsync(note.id);
          await this.sideBarService.setInitMurriFlagShowLayout();
        } else {
          await this.loadData(note.id);
        }
      }
    });
  }

  async loadData(noteId: string): Promise<void> {
    const isCanEdit = this.store.selectSnapshot(NoteStore.canEdit);
    await this.sideBarService.initializeEntities(noteId, isCanEdit);
    const result = await this.apiHistory.getHistory(noteId).toPromise();
    if (result.success) {
      this.histories = result.data;
    }
  }

  ngAfterViewInit(): void {
    this.sideBarService.murriInitialise(this.refSideBarElements, this.noteId);
  }
}
