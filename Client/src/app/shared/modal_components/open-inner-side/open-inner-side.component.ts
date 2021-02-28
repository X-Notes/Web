import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoadNotes, UnSelectAllNote } from 'src/app/content/notes/state/notes-actions';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { FontSizeENUM } from '../../enums/FontSizeEnum';
import { NoteTypeENUM } from '../../enums/NoteTypesEnum';
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
  fontSize = FontSizeENUM;
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
    
    const types = this.store.selectSnapshot(AppStore.getNoteTypes);
    const type = types.find(x => x.name === NoteTypeENUM.Private);
    await this.store.dispatch(new LoadNotes(type.id, type)).toPromise();

    const actions = types.filter(x => x.id !== type.id).map(t => new LoadNotes(t.id, t));
    this.store.dispatch(actions);

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
