import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer2,
  ViewChildren,
} from '@angular/core';
import { Store } from '@ngxs/store';
import {
  deleteSmallNote,
  PersonalizationService,
  showHistory,
} from 'src/app/shared/services/personalization.service';
import { SmallNote } from '../../models/small-note.model';
import { NoteHistory } from '../models/history/note-history.model';
import { ApiNoteHistoryService } from '../services/api-note-history.service';
import { FullNoteSliderService } from '../services/full-note-slider.service';
import { SidebarNotesService } from '../services/sidebar-notes.service';

@Component({
  selector: 'app-right-section-content',
  templateUrl: './right-section-content.component.html',
  styleUrls: ['./right-section-content.component.scss'],
  animations: [deleteSmallNote, showHistory],
})
export class RightSectionContentComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() note: SmallNote;

  @Input() wrap: ElementRef;

  @ViewChildren('relatedItem', { read: ElementRef }) refSideBarElements: QueryList<ElementRef>;

  histories: NoteHistory[];

  constructor(
    public sliderService: FullNoteSliderService,
    public pService: PersonalizationService,
    public sideBarService: SidebarNotesService,
    private apiHistory: ApiNoteHistoryService,
    private store: Store,
    private rend: Renderer2,
  ) {}

  @HostListener('window:resize', ['$event'])
  sizeChange() {
    if (!this.pService.check()) {
      this.sliderService.getSize();
    } else {
      this.sliderService.mainWidth = null;
      this.rend.setStyle(this.wrap?.nativeElement, 'transform', `translate3d( ${0}%,0,0)`);
      this.sliderService.active = 0;
    }
  }

  ngOnDestroy(): void {
    this.sideBarService.murriService.flagForOpacity = false;
  }

  async ngOnInit() {
    this.sliderService.rend = this.rend;
    this.sliderService.initWidthSlide();

    await this.sideBarService.loadNotes(this.note.id);
    const result = await this.apiHistory.getHistory(this.note.id).toPromise();
    if (result.success) {
      this.histories = result.data;
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => console.log('WRAp: ', this.wrap), 2000); // TODO CHANGE THIS
    setTimeout(() => this.sliderService.goTo(this.sliderService.active, this.wrap), 2000);
    this.sideBarService.murriInitialise(this.refSideBarElements, this.note.id);
  }
}
