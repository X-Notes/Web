import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer2,
  ViewChildren,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiServiceNotes } from 'src/app/content/notes/api-notes.service';
import { SmallNote } from 'src/app/content/notes/models/smallNote';
import { UnSelectAllNote } from 'src/app/content/notes/state/notes-actions';
import { FontSizeENUM } from '../../enums/FontSizeEnum';
import { MurriService } from '../../services/murri.service';
import { PersonalizationService, showDropdown } from '../../services/personalization.service';

@Component({
  selector: 'app-open-inner-side',
  templateUrl: './open-inner-side.component.html',
  styleUrls: ['./open-inner-side.component.scss'],
  animations: [showDropdown],
  providers: [MurriService],
})
export class OpenInnerSideComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  loaded = false;

  fontSize = FontSizeENUM;

  destroy = new Subject<void>();

  selectTypes = ['all', 'personal', 'shared', 'archive', 'bin'];

  selectedNotes: SmallNote[] = [];

  notes = [];

  firstInitedMurri = false;

  constructor(
    private store: Store,
    public murriService: MurriService,
    public pService: PersonalizationService,
    public dialogRef: MatDialogRef<OpenInnerSideComponent>,
    public renderer: Renderer2,
    private api: ApiServiceNotes,
  ) {}

  async ngAfterViewInit(): Promise<void> {
    this.refElements.changes.pipe(takeUntil(this.destroy)).subscribe(async (z) => {
      if (z.length === this.notes.length && !this.firstInitedMurri) {
        this.murriService.initMurriAllNote('.grid-modal-item');
        await this.murriService.setOpacityTrueAsync();
        this.firstInitedMurri = true;
      }
    });
  }

  ngOnInit() {
    this.pService.setSpinnerState(true);
    this.dialogRef
      .afterOpened()
      .pipe(takeUntil(this.destroy))
      .subscribe(async () => {
        this.loadContent();
      });
  }

  async loadContent() {
    this.notes = await this.api.getAll().toPromise();
    await this.pService.waitPreloading();
    this.pService.setSpinnerState(false);
    this.loaded = true;
  }

  highlightNote(note: SmallNote) {
    if (!this.selectedNotes.some((x) => x.id === note.id)) {
      this.selectedNotes.push(note);
      // eslint-disable-next-line no-param-reassign
      note.isSelected = true;
    } else {
      this.selectedNotes = this.selectedNotes.filter((x) => x.id !== note.id);
      // eslint-disable-next-line no-param-reassign
      note.isSelected = false;
    }
  }

  unSelectNote(note: SmallNote) {
    this.selectedNotes = this.selectedNotes.filter((ч) => ч.id !== note.id);
  }

  ngOnDestroy(): void {
    this.murriService.flagForOpacity = false;
    this.murriService.muuriDestroy();
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new UnSelectAllNote());
  }

  selectItem = (item) => {
    console.log(item);
  };
}
