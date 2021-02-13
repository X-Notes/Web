import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
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

  isOpenDropdown = false;
  loaded = false;
  fontSize = FontSize;
  destroy = new Subject<void>();
  selectTypes = ['All', 'Personal', 'Shared', 'Archive', 'Bin'];
  notes = [];
  firstInitedMurri = false;
  @ViewChildren('item', { read: ElementRef,  }) refElements: QueryList<ElementRef>;

  public positions = [
    new ConnectionPositionPair({
        originX: 'end',
        originY: 'bottom'},
        {overlayX: 'end',
        overlayY: 'top'},
        0,
        1)
  ];
  constructor(private store: Store,
              public murriService: MurriService,
              public pService: PersonalizationService) { }

  ngAfterViewInit(): void {
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

  async ngOnInit() {
    this.pService.setSpinnerState(true);
    setTimeout(async () => {
      await this.loadContent();
    }, 500);
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
    console.log(note);
  }

  ngOnDestroy(): void {
    this.murriService.flagForOpacity = false;
    this.murriService.muuriDestroy();
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new UnSelectAllNote());
  }

  closeDropdown() {
    this.isOpenDropdown = false;
  }

}
