import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoadAllExceptNotes, LoadPrivateNotes, UnSelectAllNote } from 'src/app/content/notes/state/notes-actions';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { FontSize } from '../../enums/FontSize';
import { NoteType } from '../../enums/NoteTypes';
import { MurriService } from '../../services/murri.service';
import { PersonalizationService, showDropdown } from '../../services/personalization.service';

@Component({
  selector: 'app-open-inner-side',
  templateUrl: './open-inner-side.component.html',
  styleUrls: ['./open-inner-side.component.scss'],
  animations: [ showDropdown ],
  providers: [ MurriService ]
})
export class OpenInnerSideComponent implements OnInit, OnDestroy, AfterViewInit {

  loaded = false;
  fontSize = FontSize;
  destroy = new Subject<void>();
  selectTypes = ['all', 'personal', 'shared', 'archive', 'bin'];
  selectedNotes = [];
  notes = [];
  firstInitedMurri = false;
  @ViewChildren('item', { read: ElementRef,  }) refElements: QueryList<ElementRef>;

  constructor(private store: Store,
              public murriService: MurriService,
              public pService: PersonalizationService,
              public dialogRef: MatDialogRef<OpenInnerSideComponent>,
              public renderer: Renderer2) { }

  async ngAfterViewInit(): Promise<void> {
    this.refElements.changes
    .pipe(takeUntil(this.destroy))
    .subscribe(async (z) => {
      if (z.length === this.notes.length && !this.firstInitedMurri)
      {
        this.murriService.initMurriAllNote('.grid-modal-item');
        await this.murriService.setOpacityTrueAsync();
        this.firstInitedMurri = true;
      }
    });
  }

   ngOnInit() {
    this.pService.setSpinnerState(true);
    this.dialogRef.afterOpened().pipe(takeUntil(this.destroy))
    .subscribe(async () => {
      this.loadContent();
    });
  }

  async loadContent() {
    await this.store.dispatch(new LoadPrivateNotes()).toPromise();
    this.store.dispatch(new LoadAllExceptNotes(NoteType.Private));

    // TODO SELECT ALL NOTES

    this.notes = this.store.selectSnapshot(NoteStore.privateNotes);

    await this.pService.waitPreloading();
    this.pService.setSpinnerState(false);
    this.loaded = true;
  }

  highlightNote(note) {
    this.selectedNotes.push(note);
  }

  unSelectNote(note) {
    this.selectedNotes = this.selectedNotes.filter(x => x.id !== note.id);
  }

  ngOnDestroy(): void {
    this.murriService.flagForOpacity = false;
    this.murriService.muuriDestroy();
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new UnSelectAllNote());
  }

  selectItem(item) {
    console.log(item);
  }
}
