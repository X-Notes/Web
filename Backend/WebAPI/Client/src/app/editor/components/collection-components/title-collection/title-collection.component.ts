import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { ApiBrowserTextService } from 'src/app/content/notes/api-browser-text.service';
import { UpdateCursorAction } from 'src/app/content/notes/state/editor-actions';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { updateCollectionTitleDelay } from 'src/app/core/defaults/bounceDelay';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { TextCursor } from 'src/app/editor/entities-ui/cursors-ui/text-cursor';
import { TextCursorUI } from 'src/app/editor/entities-ui/cursors-ui/text-cursor-ui';
import { SaveSelection } from 'src/app/editor/entities-ui/save-selection';
import { UpdateCursor } from 'src/app/editor/entities/cursors/cursor';
import { CursorTypeENUM } from 'src/app/editor/entities/cursors/cursor-type.enum';
import { NoteUserCursorWS } from 'src/app/editor/entities/ws/note-user-cursor';
import { ClickableContentService } from 'src/app/editor/ui-services/clickable-content.service';
import { SelectionService } from 'src/app/editor/ui-services/selection.service';

@Component({
  selector: 'app-title-collection',
  templateUrl: './title-collection.component.html',
  styleUrls: ['./title-collection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleCollectionComponent implements OnInit, OnDestroy {
  @ViewChild('titleHtml') titleHtml: ElementRef<HTMLElement>;

  @Output()
  changeTitleEvent = new EventEmitter<string>();

  @Output()
  clickInputEvent = new EventEmitter();

  @Input()
  menu: any;

  @Input()
  isReadOnlyMode = false;

  @Input()
  isSelectionStart = false;

  @Input()
  isDisableButton = false;

  @Input()
  isShowButton = false;

  @Input()
  textContent = '';

  viewTextContent = '';

  @Input()
  contentId: string;

  @Input()
  cursors$: Observable<NoteUserCursorWS[]>;

  destroy = new Subject<void>();

  nameCollectionChanged: Subject<string> = new Subject<string>();

  constructor(
    public store: Store,
    private apiBrowser: ApiBrowserTextService,
    public clickableService: ClickableContentService,
    private selectionService: SelectionService,
    private cdr: ChangeDetectorRef) { }

  get isFocusedOnTitle(): boolean {
    return document.activeElement === this.titleHtml.nativeElement;
  }

  get isButtonActive(): boolean {
    return this.isShowButton && !this.isSelectionStart;
  }

  get uiCursors$(): Observable<TextCursorUI[]> {
    return this.getCursors()?.pipe(
      map((x) => {
        return x.map((q) => this.mapCursor(q)).filter((q) => q);
      }),
    );
  }

  get cursorShift() {
    return { top: 1, left: -1 };
  }

  isContentEmpty() {
    return this.titleHtml?.nativeElement?.textContent.length === 0;
  }

  getCursors(): Observable<TextCursor[]> {
    const userId = this.store.selectSnapshot(UserStore.getUser).id;
    return this.cursors$?.pipe(
      map((x) => {
        return x
          .filter(
            (q) =>
              q.userId !== userId &&
              q.entityId === this.contentId &&
              q.type === CursorTypeENUM.collectionTitle,
          )
          .map((t) => new TextCursor(t.startCursor, t.endCursor, t.color));
      }),
    );
  }

  mapCursor(cursor: TextCursor): TextCursorUI {
    const el = this.titleHtml?.nativeElement;
    if (!el) return null;
    const elRects = el.getBoundingClientRect();
    const selection: SaveSelection = {
      start: cursor.startCursor,
      end: cursor.endCursor,
    };
    if (this.isContentEmpty()) {
      return new TextCursorUI(this.cursorShift.left, this.cursorShift.top, cursor.color);
    }
    const range = this.apiBrowser.restoreSelection(el, selection, false);
    const pos = range.getBoundingClientRect();
    const cursorLeft = pos.left - elRects.left + this.cursorShift.left;
    const cursorTop = pos.top - elRects.top + this.cursorShift.top;
    return new TextCursorUI(cursorLeft, cursorTop, cursor.color);
  }

  ngOnInit(): void {
    this.setTitleUI(this.textContent);
    this.nameCollectionChanged
      .pipe(takeUntil(this.destroy), debounceTime(updateCollectionTitleDelay))
      .subscribe((name) => {
        this.changeTitleEvent.emit(name);
      });
  }

  setTitleUI(viewTextContent: string): void {
    this.viewTextContent = viewTextContent;
  }

  onTitleChangeInput($event: Event) {
    const text = ($event.target as HTMLInputElement).innerText;
    this.nameCollectionChanged.next(text);
  }

  detectChange(): void {
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  focusOnTitle(): void {
    this.titleHtml?.nativeElement?.focus();
  }

  onSelectStart(): void {
    this.selectionService.disableDiv$.next(true);
  }

  scrollToTitle(behavior: ScrollBehavior = 'smooth', block: ScrollLogicalPosition = 'center') {
    this.titleHtml.nativeElement.scrollIntoView({ behavior, block });
  }

  preventEnter = ($event: Event): void => {
    $event.preventDefault();
  };

  onClick(): void {
    this.clickInputEvent.emit();
    this.clickableService.cursorChanged$.next(() => this.updateContentEditableCursor());
  }

  getSelection(): SaveSelection {
    const el = this.titleHtml?.nativeElement;
    if (!el) return null;
    return this.apiBrowser.getSelectionInfo(el);
  }

  updateContentEditableCursor(): void {
    const position = this.getSelection();
    if (position) {
      this.updateCursor(position.start, position.end);
    }
  }

  updateCursor(startCursor: number, endCursor: number): void {
    const color = this.store.selectSnapshot(NoteStore.cursorColor);
    const noteId = this.store.selectSnapshot(NoteStore.oneFull).id;
    const cursor = new UpdateCursor(color).initCollectionTitleCursor(
      this.contentId,
      startCursor,
      endCursor,
    );
    this.store.dispatch(new UpdateCursorAction(noteId, cursor));
  }
}
