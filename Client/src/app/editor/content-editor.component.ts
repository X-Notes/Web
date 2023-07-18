/* eslint-disable no-param-reassign */
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { CdkDragDrop, CdkDragEnd, CdkDragStart, moveItemInArray } from '@angular/cdk/drag-drop';
import { InputHtmlEvent } from './entities-ui/input-html-event';
import { UpdateTextStyles } from './entities-ui/update-text-styles';
import { DeltaConverter } from './converter/delta-converter';
import { WebSocketsNoteUpdaterService } from './services/web-sockets-note-updater.service';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { NoteTextTypeENUM } from './entities/contents/text-models/note-text-type.enum';
import { DeltaStatic } from 'quill';
import { MurriService } from 'src/app/shared/services/murri.service';
import { BaseUndoAction } from './entities-ui/undo/base-undo-action';
import { UndoActionTypeEnum } from './entities-ui/undo/undo-action-type.enum';
import { Label } from '../content/labels/models/label.model';
import { AudioService } from '../content/notes/audio.service';
import { ClearCursorsAction, UpdateCursorAction } from '../content/notes/state/editor-actions';
import { NoteStore } from '../content/notes/state/notes-state';
import { DestroyComponentService } from '../shared/services/destroy-component.service';
import { EditorCollectionsComponent } from './base-components/editor-collections.component';
import { HtmlComponentsFacadeService } from './components/html-components.facade.service';
import { TextEditMenuOptions } from './components/text-edit-menu/models/text-edit-menu-options';
import { TextEditMenuEnum } from './components/text-edit-menu/models/text-edit-menu.enum';
import { SaveSelection } from './entities-ui/save-selection';
import { ChangePositionAction } from './entities-ui/undo/change-position-action';
import { RestoreTextAction } from './entities-ui/undo/restore-text-action';
import { UpdateTextTypeAction } from './entities-ui/undo/update-text-type-action';
import { UpdateCursor } from './entities/cursors/cursor';
import { UpdateContentPosition } from './entities/ws/update-content-position-ws';
import { ContentEditorSyncService } from './services/content-editor-sync.service';
import { ContentUpdateWsService } from './services/content-update-ws.service';
import { EditorFacadeService } from './services/editor-facade.service';
import { ClickableContentService } from './ui-services/clickable-content.service';
import { ContentEditorMomentoStateService } from './ui-services/contents/content-editor-momento-state.service';
import { ContentEditorRestoreService } from './ui-services/contents/content-editor-restore.service';
import { ContentEditorTextService } from './ui-services/contents/content-editor-text.service';
import { HtmlPropertyTagCollectorService } from './ui-services/html-property-tag-collector.service';
import { ParentInteraction, ParentInteractionHTML } from './components/parent-interaction.interface';
import { MenuSelectionDirective } from './directives/menu-selection.directive';
import { SelectionDirective } from './directives/selection.directive';
import { EnterEvent } from './entities-ui/enter-event.model';
import { TransformContent } from './entities-ui/transform-content.model';
import { BaseText } from './entities/contents/base-text';
import { ContentModelBase } from './entities/contents/content-model-base';
import { ContentTypeENUM } from './entities/contents/content-types.enum';
import { ContentEditorAudiosCollectionService } from './services/collections/content-editor-audios.service';
import { ContentEditorDocumentsCollectionService } from './services/collections/content-editor-documents.service';
import { ContentEditorPhotosCollectionService } from './services/collections/content-editor-photos.service';
import { ContentEditorVideosCollectionService } from './services/collections/content-editor-videos.service';
import { ContentEditorElementsListenerService } from './ui-services/content-editor-elements-listener.service';
import { ContentEditorListenerService } from './ui-services/content-editor-listener.service';
import { ContentEditorContentsService } from './ui-services/contents/content-editor-contents.service';
import { LoadOnlineUsersOnNote } from '../content/notes/state/notes-actions';

@Component({
  selector: 'app-content-editor',
  templateUrl: './content-editor.component.html',
  styleUrls: ['./content-editor.component.scss'],
  providers: [
    WebSocketsNoteUpdaterService,
    EditorFacadeService,
    DestroyComponentService,
    HtmlComponentsFacadeService,
    ContentEditorMomentoStateService,
    ContentEditorContentsService,
    ContentEditorAudiosCollectionService,
    ContentEditorDocumentsCollectionService,
    ContentEditorPhotosCollectionService,
    ContentEditorVideosCollectionService,
    ContentUpdateWsService,
    ContentEditorSyncService,
    ContentEditorRestoreService,
    ContentEditorTextService,
    ClickableContentService,
    ContentEditorListenerService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentEditorComponent
  extends EditorCollectionsComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild(SelectionDirective) selectionDirective?: SelectionDirective;

  @ViewChild(MenuSelectionDirective) menuSelectionDirective?: MenuSelectionDirective;

  @ViewChild('textEditMenu', { read: ElementRef, static: false })
  textEditMenu?: ElementRef<HTMLElement>;

  @ViewChild('mainSection', { read: ElementRef }) mainSection?: ElementRef<HTMLElement>;

  @Input()
  editorTheme?: ThemeENUM;

  @Input()
  color?: string;

  @Input()
  labels?: Label[] = [];

  @Input() progressiveLoading = false;

  theme = ThemeENUM;

  contentType = ContentTypeENUM;

  textType = NoteTextTypeENUM;

  options?: TextEditMenuOptions;

  emptyFocus = false;

  ngForSubject = new Subject<void>(); // for lazy loading

  constructor(
    private contentEditorElementsListenersService: ContentEditorElementsListenerService,
    private contentEditorListenerService: ContentEditorListenerService,
    private webSocketsUpdaterService: WebSocketsNoteUpdaterService,
    public pS: PersonalizationService,
    private htmlPTCollectorService: HtmlPropertyTagCollectorService,
    editorApiFacadeService: EditorFacadeService,
    public audioService: AudioService,
    private muuriService: MurriService
  ) {
    super(editorApiFacadeService);
  }

  get isSelectModeActive(): boolean {
    const isAnySelect = this.facade.selectionService.isAnySelect();
    const divActive = this.selectionDirective?.isDivActive;
    return isAnySelect || divActive;
  }


  get selectedMenuType(): TextEditMenuEnum {
    return this.facade.selectionService.selectedMenuType;
  }

  get isTextMenuActive(): boolean {
    return (
      this.selectedMenuType !== null &&
      !!this.options &&
      this.options.ids?.length > 0
    );
  }

  get isMobileMenuActive$(): Observable<boolean> {
    return this.pS.isTransformMenuMobile$.pipe(
      map((x) => x === true && this.facade.clickableContentService.isEmptyTextItemFocus),
    );
  }

  get textEditMenuTop(): number {
    if (this.selectedMenuType === TextEditMenuEnum.OneRow) {
      return (
        this.facade.selectionService.getCursorTop -
        this.textEditMenu.nativeElement.offsetHeight -
        this.mainSection.nativeElement.scrollTop
      );
    }
    if (this.selectedMenuType === TextEditMenuEnum.MultiplyRows) {
      const top = Math.min(...this.selectedElementsRects.map((x) => x.top));
      const resTop = top - this.textEditMenu.nativeElement.offsetHeight;
      return resTop < 52 ? 52 : resTop; // to stick menu while select couple of elements and scroll down
    }
    return 0;
  }

  get textEditMenuLeft(): number {
    if (this.selectedMenuType === TextEditMenuEnum.OneRow) {
      return this.facade.selectionService.getCursorLeft;
    }
    if (this.selectedMenuType === TextEditMenuEnum.MultiplyRows) {
      return Math.min(...this.selectedElementsRects.map((x) => x.left)) + 150;
    }
    return 0;
  }

  get lastContentId(): string {
    return this.contents[this.contents.length - 1].id;
  }

  get contents(): ContentModelBase[] | any[] {
    return this.facade.contentsService.getContents;
  }

  get selectedElementsRects(): DOMRect[] {
    return this.getSelectedElements()?.map((x) =>
      x.getHost().nativeElement.getBoundingClientRect(),
    );
  }

  get selectedTextElements(): BaseText[] {
    return this.getSelectedHTMLElements()?.map((x) => x.getContent() as BaseText);
  }

  get selectedTextElement(): BaseText {
    return this.selectedTextElements.length > 0 ? this.selectedTextElements[0] : null;
  }

  // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
  @Input() set contents(contents: ContentModelBase[]) {
    if (!this.options$.getValue().userId) {
      this.facade.contentsService.initOnlyRead(contents, this.progressiveLoading);
      this.facade.contentEditorSyncService.initRead(this.options$);
    } else {
      this.facade.contentsService.initEdit(contents, this.progressiveLoading);
      this.facade.contentEditorSyncService.initEdit(this.options$);
    }

    if (contents.length === 0) {
      this.facade.contentEditorTextService.appendNewEmptyContentToEnd();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.noteId && changes.noteId.currentValue !== changes.noteId.previousValue) {
      this.initTitle(this.title);
      this.facade.momentoStateService.clear();
      this.titleInited = false;
    }
  }

  ngAfterViewInit(): void {
    this.initKeyAndMouseHandlers();
    if (this.options$.getValue().noteId && this.options$.getValue().connectToNote && this.options$.getValue().userId) {
      this.webSocketsUpdaterService.tryJoinToNote(this.options$.getValue().noteId);
      this.webSocketsUpdaterService.exceedLimitUsersOnNote$.pipe(takeUntil(this.facade.dc.d$)).subscribe(flag => {
        if (flag) {
          this.leaveNote();
        }
      })
    }
  }

  initKeyAndMouseHandlers(): void {
    this.contentEditorElementsListenersService.setHandlers(this.elementsQuery, this.options$);
    this.contentEditorListenerService.setHandlers(this.elementsQuery, this.noteTitleEl, this.options$);
    this.selectionDirective.initSelectionDrawer(this.mainSection.nativeElement);
    this.facade.selectionService.onSelectChanges$
      .pipe(takeUntil(this.facade.dc.d$))
      .subscribe(() => {
        if (this.options$.getValue().isReadOnlyMode) {
          return;
        }
        this.options = this.buildMenuOptions();
        this.facade.cdr.detectChanges();
      });
  }

  buildMenuOptions(): TextEditMenuOptions {
    const htmlElements = this.getSelectedHTMLElements();
    const obj: TextEditMenuOptions = {
      isBold: this.htmlPTCollectorService.getIsBold(this.selectedMenuType, htmlElements),
      isItalic: this.htmlPTCollectorService.getIsItalic(this.selectedMenuType, htmlElements),
      ids: this.facade.selectionService.getAllSelectedItems(),
      textType: this.selectedTextElement?.noteTextTypeId,
      headingType: this.selectedTextElement?.headingTypeId,
      isOneRowType: this.selectedMenuType === TextEditMenuEnum.OneRow,
      backgroundColor: this.htmlPTCollectorService.getProperty(
        'backgroundColor',
        this.selectedMenuType,
        htmlElements,
      ),
      color: this.htmlPTCollectorService.getProperty('color', this.selectedMenuType, htmlElements),
    };
    return obj;
  }

  ngOnDestroy(): void {
    this.facade.selectionService.resetSelectionAndItems();
    this.muuriService.resetToDefaultOpacity();
    this.leaveNote();
    this.contentEditorElementsListenersService.destroysListeners();
    this.contentEditorListenerService.destroysListeners();
    this.facade.store.dispatch(ClearCursorsAction);
    this.resetCursor();
  }

  loadUsers(): void {
    if (this.options$.getValue().noteId && this.options$.getValue().userId) {
      this.facade.store.dispatch(new LoadOnlineUsersOnNote(this.options$.getValue().noteId));
    }
  }

  leaveNote(): void {
    if (this.options$.getValue().noteId && this.options$.getValue().userId) {
      this.webSocketsUpdaterService.leaveNote(this.options$.getValue().noteId);
    }
  }

  ngOnInit(): void {

    this.facade.clickableContentService.cursorUpdatingActive = this.cursorActive;

    this.iniTitle(this.title);
    this.initTitleSubscription();
    this.subscribeOnButtons();
    this.facade.contentUpdateWsService.noteId = this.options$.getValue().noteId;

    this.ngForSubject.pipe(takeUntil(this.facade.dc.d$)).subscribe(() => {
      this.facade.cdr.detectChanges();
    });

    this.facade.contentsService.onProgressiveAdding
      .pipe(takeUntil(this.facade.dc.d$))
      .subscribe(() => {
        this.facade.cdr.detectChanges();
      });

    this.facade.contentUpdateWsService.changes$.pipe(takeUntil(this.facade.dc.d$)).subscribe(() => {
      this.facade.cdr.detectChanges();
      this.menuSelectionDirective.onSelectionchange();
    });

    this.loadUsers();
  }

  subscribeOnButtons(): void {
    this.contentEditorElementsListenersService.onPressDeleteOrBackSpaceSubject
      .pipe(takeUntil(this.facade.dc.d$))
      .subscribe(() => {
        if (this.options$.getValue().isReadOnlyMode) {
          return;
        }
        for (const itemId of this.facade.selectionService.getSelectedItems()) {
          this.deleteRowHandler(itemId);
          this.facade.selectionService.removeFromSelectedItems(itemId);
        }
      });

    this.contentEditorElementsListenersService.onPressCtrlASubject
      .pipe(takeUntil(this.facade.dc.d$))
      .subscribe(() => {
        if (this.options$.getValue().isReadOnlyMode) {
          return;
        }
        this.facade.apiBrowser.removeAllRanges();
        const ids = this.contents.map((x) => x.id);
        this.facade.selectionService.selectItems(ids);
        this.facade.cdr.detectChanges();
      });

    this.contentEditorElementsListenersService.onPressCtrlZSubject
      .pipe(takeUntil(this.facade.dc.d$))
      .subscribe(() => {
        if (this.options$.getValue().isReadOnlyMode) {
          return;
        }
        const updateTitleFunc = (title: string) => {
          this.setHtmlTitle(title);
          this.pushChangesToTitle(title, false);
        };
        const ids = this.facade.contentEditorRestoreService.restorePrev(updateTitleFunc);
        for (const id of ids) {
          const el = this.getElementById(id);
          if (el) {
            el.syncLayoutWithContent();
            el.detectChanges();
          }
        }
        this.facade.cdr.detectChanges();
      });

    this.contentEditorElementsListenersService.onPressCtrlSSubject
      .pipe(takeUntil(this.facade.dc.d$))
      .subscribe(() => {
        if (this.options$.getValue().isReadOnlyMode) {
          return;
        }
        this.facade.contentEditorSyncService.changeImmediately()
      });

    this.contentEditorListenerService.onPressEnterSubject
      .pipe(takeUntil(this.facade.dc.d$))
      .subscribe((contentId: string) => {
        if (this.options$.getValue().isReadOnlyMode) {
          return;
        }
        if (contentId) {
          this.enterHandler({
            breakModel: { isFocusToNext: true },
            nextItemType: NoteTextTypeENUM.default,
            contentId,
          });
        }
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFocusHandler(content: ParentInteraction<ContentModelBase>): void {
    this.facade.clickableContentService.prevItem?.detectChanges();
  }

  selectionHandler(secondRect: DOMRect) {
    this.facade.selectionService.selectionHandler(
      secondRect,
      this.elementsQuery,
      this.selectionDirective.isDivTransparent,
    );
  }

  selectionStartHandler($event: DOMRect): void {
    const isSelectionInZone = this.facade.selectionService.isSelectionInZone(
      $event,
      this.elementsQuery,
      this.noteTitleEl,
    );
    this.selectionDirective.setIsShowDiv(!isSelectionInZone);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectionEndHandler($event: DOMRect): void {
    if (!this.isSelectModeActive) return;
    this.facade.apiBrowser.removeAllRanges();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onScroll($event: Event): void { }

  enterHandler(value: EnterEvent) {
    const curEl = this.getHTMLElementById(value.contentId);
    curEl.syncHtmlWithLayout();
    const newTextContent = this.facade.contentEditorTextService.insertNewContent(
      value.contentId,
      value.nextItemType,
      value.breakModel.isFocusToNext,
    );
    const action = new BaseUndoAction(UndoActionTypeEnum.deleteContent, newTextContent.content.id);
    this.facade.momentoStateService.saveToStack(action);
    this.facade.cdr.detectChanges();

    const el = this.getElementByIndex<ParentInteractionHTML>(newTextContent.index);
    const contents = DeltaConverter.convertHTMLToTextBlocks(value.breakModel.nextHtml);
    el.updateContentsAndSync(contents, () => el.setFocus());
    el.detectChanges();
  }

  deleteRowHandler(id: string): void {
    const res = this.facade.contentsService.getContentAndIndexById<BaseText>(id);
    if (!res) return;
    const action = new RestoreTextAction(res.content, res.index);
    this.facade.momentoStateService.saveToStack(action);
    const index = this.facade.contentsService.deleteContent(id);
    if (index !== 0) {
      this.elements[index - 1].setFocusToEnd();
    }
    this.postAction();
  }

  concatThisWithPrev(el: ParentInteractionHTML) {
    const id = el.getContentId();
    const data = this.facade.contentsService.getContentAndIndexById<BaseText>(id);
    const indexPrev = data.index - 1;

    if (indexPrev < 0) {
      return;
    }

    const prevContent = this.facade.contentsService.getContentByIndex<BaseText>(indexPrev);

    const prevElement = this.getHTMLElementById(prevContent.id);

    if (!prevElement) {
      return;
    }

    const resContent = [...prevElement.getTextBlocks(), ...el.getTextBlocks()];

    const action = new RestoreTextAction(data.content, data.index);
    this.facade.momentoStateService.saveToStack(action);

    prevElement.updateContentsAndSync(resContent, () => prevElement.setFocusToEnd());
    el.syncHtmlWithLayout();
    prevElement.detectChanges();

    this.facade.contentsService.deleteById(id, false);

    this.postAction();
  }

  getTextContent(index: number): BaseText {
    return this.contents[index] as BaseText;
  }

  getNumberList(content: ContentModelBase, contentIndex: number): number {
    const text = content as BaseText;
    const prev = this.getTextContent(contentIndex - 1);
    if (!prev || prev.noteTextTypeId !== NoteTextTypeENUM.numberList) {
      text.listNumber = 1;
      return text.listNumber;
    }
    text.listNumber = prev.listNumber + 1;
    return text.listNumber;
  }

  transformToTypeText(value: TransformContent): void {
    const content = this.getHTMLElementById(value.contentId);
    if (!content) return;
    const c = content.getContent();
    const action = new UpdateTextTypeAction(c.id, c.noteTextTypeId, c.headingTypeId);
    this.facade.momentoStateService.saveToStack(action);
    const selection = content.getSelection();
    this.unSelectItems();
    this.facade.contentEditorTextService.transformTextContentTo(value);
    this.facade.cdr.detectChanges();
    if (selection) {
      selection.start = selection.end;
      const el = this.getHTMLElementById(content.getContentId());
      requestAnimationFrame(() => el.restoreSelection(selection));
    }
    this.postAction();
  }

  updateTextStyles = (updates: UpdateTextStyles) => {
    const selectMenuType = this.selectedMenuType;
    const elements = this.getHTMLElementsById(updates.ids);
    for (const el of elements) {
      if (!el) {
        this.unSelectItems();
        return;
      }
      const blocks = el.getTextBlocks();
      const html = DeltaConverter.convertTextBlocksToHTML(blocks);
      if (!html) continue;
      const pos = this.getIndexAndLengthForUpdateStyle(el.getEditableNative(), selectMenuType);
      let resultDelta: DeltaStatic;
      if (updates.isRemoveStyles) {
        resultDelta = DeltaConverter.removeStyles(html, pos.index, pos.length);
      } else {
        resultDelta = DeltaConverter.setStyles(
          html,
          pos.index,
          pos.length,
          updates.textStyle,
          updates.value,
        );
      }
      if (el) {
        setTimeout(() => { // need when to many elements updating at the same time and page is freezing
          const elLock = el;
          let actionRestore: () => void = null;
          if (pos.selection) {
            pos.selection.start = pos.selection.end;
            actionRestore = () => elLock.restoreSelection(pos.selection);
          }
          elLock.updateContentsAndSync(DeltaConverter.convertDeltaToTextBlocks(resultDelta), actionRestore);
        }, 5);
      }
    }
    this.unSelectItems();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateHtmlHandler(model: InputHtmlEvent): void {
    this.postAction();
    this.menuSelectionDirective.onSelectionchange(true);
  }

  unSelectItems(): void {
    this.facade.selectionService.resetSelectionAndItems();
  }

  onReset(): void {
    this.facade.clickableContentService.cursorChanged$.next(() => this.resetCursor());
  }

  resetCursor(): void {
    if (!this.options$.getValue().noteId) return;
    const color = this.facade.store.selectSnapshot(NoteStore.cursorColor);
    const cursor = new UpdateCursor(color).initNoneCursor();
    this.facade.store.dispatch(new UpdateCursorAction(this.options$.getValue().noteId, cursor));
  }

  getIndexAndLengthForUpdateStyle(
    el: HTMLElement | Element,
    menuType: TextEditMenuEnum,
  ): { index: number; length: number; selection: SaveSelection } {
    if (menuType === TextEditMenuEnum.OneRow) {
      const selection = this.facade.apiBrowser.getSelectionInfo(el);
      return { index: selection.start, length: selection.end - selection.start, selection };
    }
    if (menuType === TextEditMenuEnum.MultiplyRows) {
      return { index: 0, length: el.innerHTML.length, selection: null };
    }
    return null;
  }

  changeDetectionChecker = () => {
    // console.log('Check contents');
  };

  drop(event: CdkDragDrop<ContentModelBase[]>) {
    const positions = this.contents.map(
      (x, i) => ({ contentId: x.id, order: i } as UpdateContentPosition),
    );
    const action = new ChangePositionAction(positions);
    this.facade.momentoStateService.saveToStack(action);
    moveItemInArray(this.contents, event.previousIndex, event.currentIndex);
    this.postAction();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dragStarted = (event: CdkDragStart) => {
    this.isDragging = true;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dragEnded = (event: CdkDragEnd) => {
    this.isDragging = false;
  };

  placeHolderClick($event) {
    if (this.options$.getValue().isReadOnlyMode) {
      return;
    }
    $event.preventDefault();
    this.postAction();
    requestAnimationFrame(() => {
      this.last?.setFocus();
      this.preLast?.mouseLeave($event);
      this.preLast?.detectChanges();
    });
  }

  mouseEnter($event): void {
    this.emptyFocus = true;
    this.last?.detectChanges();
  }

  mouseOut($event): void {
    this.emptyFocus = false;
    this.last?.detectChanges();
  }

  onChangePermissions(): void {
    if (this.options$.getValue().isReadOnlyMode) {
      this.unSelectItems();
    }
  }
}
