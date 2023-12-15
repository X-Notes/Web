import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  deleteSmallNote,
  PersonalizationService,
  showHistory,
} from 'src/app/shared/services/personalization.service';
import { NoteStore } from '../../state/notes-state';
import { SidebarNotesService } from '../services/sidebar-notes.service';
import { SelectionService } from 'src/app/editor/ui-services/selection.service';
import { Label } from 'src/app/content/labels/models/label.model';
import { LabelStore } from 'src/app/content/labels/state/labels-state';

@Component({
  selector: 'app-right-section-content',
  templateUrl: './right-section-content.component.html',
  styleUrls: ['./right-section-content.component.scss'],
  animations: [deleteSmallNote, showHistory],
  providers: [SidebarNotesService],
})
export class RightSectionContentComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() noteId: string;

  @Select(NoteStore.canEdit)
  public canEdit$: Observable<boolean>;

  @Select(LabelStore.noDeleted)
  public labels$: Observable<Label[]>;
  
  @ViewChildren('relatedItem', { read: ElementRef }) refSideBarElements: QueryList<ElementRef>;

  loading = true;

  constructor(
    public pService: PersonalizationService,
    public sideBarService: SidebarNotesService,
    private store: Store,
    private selectionService: SelectionService,
  ) { }


  async ngOnChanges(changes: SimpleChanges) {
    if (changes['noteId'].previousValue && changes['noteId'].previousValue !== changes['noteId'].currentValue) {
      await this.reInitLayout(this.noteId);
    }
  }


  startSelection($event): void {
    this.selectionService.disableDiv$.next(true);
  }

  ngOnDestroy(): void { }

  async ngOnInit() {
    if (this.noteId) {
      await this.loadData(this.noteId);
    }
  }

  async reInitLayout(noteId: string) {
    await this.sideBarService.resetLayoutAsync();
    await this.loadData(noteId);
  }

  async loadData(noteId: string): Promise<void> {
    try {
      this.loading = true;
      const isCanEdit = this.store.selectSnapshot(NoteStore.canEdit);
      await this.sideBarService.initializeEntities(noteId, isCanEdit);
      this.loading = false;
    } catch (e) {
      console.error(e);
    }
  }

  async ngAfterViewInit() {
    this.sideBarService.murriInitialise(this.refSideBarElements);
  }
}
