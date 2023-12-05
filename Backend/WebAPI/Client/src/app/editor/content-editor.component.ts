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
import { BehaviorSubject, Observable, Subject } from 'rxjs';
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
import { SaveSelection } from './entities-ui/save-selection';
import { ChangePositionAction } from './entities-ui/undo/change-position-action';
import { RestoreTextAction } from './entities-ui/undo/restore-text-action';
import { UpdateTextTypeAction } from './entities-ui/undo/update-text-metadata-action';
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
import { ComponentType, ParentInteraction, ParentInteractionHTML } from './components/parent-interaction.interface';
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
import { ContentEditorContentsService } from './ui-services/contents/content-editor-contents.service';
import { LoadOnlineUsersOnNote } from '../content/notes/state/notes-actions';
import { DrawerCoordsConfig } from './entities-ui/selection/drawer-coords';
import { EditorSelectionModeEnum } from './entities-ui/editor-selection-mode.enum';
import { KeyDownHtmlComponent } from './entities-ui/keydown-event';
import { KeyboardKeyEnum } from './entities-ui/keyboard-keys.enum';

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
    ContentEditorElementsListenerService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentEditorComponent
  extends EditorCollectionsComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild(SelectionDirective) selectionDirective?: SelectionDirective;

  @ViewChild('textEditMenu', { read: ElementRef, static: false })
  textEditMenu?: ElementRef<HTMLElement>;

  @ViewChild('selectionDrawer', { read: ElementRef, static: false })
  selectionDrawer?: ElementRef<HTMLElement>;

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

  menuOptions?: TextEditMenuOptions;

  emptyFocus = false;

  ngForSubject = new Subject<void>(); // for lazy loading

  // selection

  isDrawerVisible$ = new BehaviorSubject<boolean>(false);

  coords: DrawerCoordsConfig;

  constructor(
    private contentEditorElementsListenersService: ContentEditorElementsListenerService,
    private webSocketsUpdaterService: WebSocketsNoteUpdaterService,
    public pS: PersonalizationService,
    private htmlPTCollectorService: HtmlPropertyTagCollectorService,
    editorApiFacadeService: EditorFacadeService,
    public audioService: AudioService,
    private muuriService: MurriService
  ) {
    super(editorApiFacadeService);
  }

  get selectionMode(): EditorSelectionModeEnum {
    return this.facade.selectionService.selectionMode;
  }

  get isTextMenuActive(): boolean {
    return this.menuOptions && this.menuOptions.ids.length > 0 && this.getHTMLElementsById(this.menuOptions.ids).some(x => x.getText()?.length > 0);
  }

  get isMobileMenuActive$(): Observable<boolean> {
    return this.pS.isTransformMenuMobile$.pipe(
      map((x) => x === true && this.facade.clickableContentService.isEmptyTextItemFocus),
    );
  }

  get textEditMenuTop(): string {
    if (this.selectionMode === EditorSelectionModeEnum.DefaultSelection) {
      const selection = this.facade.apiBrowser.getSelection();
      const range = selection.getRangeAt(0);
      const coords = range.getBoundingClientRect();
      const getCursorTop = coords.top + this.mainSection.nativeElement?.scrollTop - 5;

      const res = (
        getCursorTop -
        this.textEditMenu.nativeElement.offsetHeight -
        this.mainSection.nativeElement.scrollTop
      );

      return res + 'px';
    }

    if (this.selectionMode === EditorSelectionModeEnum.EntireRow || this.selectionMode === EditorSelectionModeEnum.MultiplyRows) {
      const top = Math.min(...this.selectedElementsRects.map((x) => x.top));
      const resTop = top - this.textEditMenu.nativeElement.offsetHeight;
      return resTop < 52 ? '52px' : (resTop + 'px'); // to stick menu while select couple of elements and scroll down
    }

    return '0';
  }

  get isDrawing(): boolean {
    return this.isDrawerVisible$.getValue() && this.selectionDirective.isSelectionActive;
  }

  get textEditMenuLeft(): number {
    if (this.pS.isMobile()) {
      const textMenuWidth = this.textEditMenu?.nativeElement?.offsetWidth ?? 0;
      return (this.pS.windowWidth$.getValue() - textMenuWidth) / 2;
    }

    if (this.selectionMode === EditorSelectionModeEnum.DefaultSelection) {
      const selection = this.facade.apiBrowser.getSelection();
      const range = selection.getRangeAt(0);
      const coords = range.getBoundingClientRect();
      return (coords.left + coords.right) / 2;
    }

    if (this.selectionMode === EditorSelectionModeEnum.EntireRow || this.selectionMode === EditorSelectionModeEnum.MultiplyRows) {
      return Math.min(...this.selectedElementsRects.map((x) => x.left)) + 150;
    }

    return 0;
  }

  get lastContentId(): string {
    return this.contents[this.contents.length - 1].id;
  }

  get mainContentHeight() {
    return this.mainSection?.nativeElement?.clientHeight
  }

  get contents(): ContentModelBase[] | any[] {
    return this.facade.contentsService.getContents;
  }

  get selectedElementsRects(): DOMRect[] {
    if (!this.menuOptions?.ids || this.menuOptions.ids.length === 0) return [];
    return this.getHTMLElementsById(this.menuOptions.ids).filter(x => x.getText()?.length > 0)?.map((x) =>
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
      this.facade.momentoStateService.clear();
      this.titleInited = false;
      this.initTitle(this.title);
    }
  }

  ngAfterViewInit(): void {
    this.initKeyAndMouseHandlers();
    if (this.options$.getValue().noteId && this.options$.getValue().connectToNote && this.options$.getValue().userId) {
      this.webSocketsUpdaterService.tryJoinToNote(this.options$.getValue().noteId);
    }
  }

  initKeyAndMouseHandlers(): void {
    this.contentEditorElementsListenersService.setHandlers(this.elementsQuery, this.noteTitleEl, this.options$);
    this.selectionDirective.initSelectionDrawer(this.mainSection.nativeElement);
    this.facade.selectionService.onSelectChanges$
      .pipe(takeUntil(this.facade.dc.d$))
      .subscribe(() => {
        if (this.options$.getValue().isReadOnlyMode) {
          return;
        }
        if (this.selectionMode === EditorSelectionModeEnum.MultiplyRows || this.isDrawing) {
          this.facade.apiBrowser.removeAllRanges();
        }
        this.menuOptions = this.buildMenuOptions();
        this.facade.cdr.detectChanges();
        setTimeout(() => this.facade.cdr.detectChanges(), 50);
      });
  }


  buildMenuOptions(): TextEditMenuOptions {
    if (this.selectionMode === EditorSelectionModeEnum.DefaultSelection) {
      const item = this.getHTMLElementById(this.facade.selectionService.selectionTextItemId).getContent();
      const obj: TextEditMenuOptions = {
        isBold: this.htmlPTCollectorService.getIsBoldSelection(),
        isItalic: this.htmlPTCollectorService.getIsItalicSelection(),
        textType: item?.metadata?.noteTextTypeId,
        headingType: item?.metadata?.hTypeId,
        isOneRowType: true,
        backgroundColor: this.htmlPTCollectorService.getPropertySelection('backgroundColor'),
        color: this.htmlPTCollectorService.getPropertySelection('color'),
        ids: [this.facade.selectionService.selectionTextItemId]
      };
      return obj;
    }
    if (this.selectionMode === EditorSelectionModeEnum.EntireRow || this.selectionMode === EditorSelectionModeEnum.MultiplyRows) {
      const htmlElements = this.getSelectedHTMLElements().filter(x => x.getText()?.length > 0);
      if (htmlElements.length <= 0) {
        return null;
      }
      const obj: TextEditMenuOptions = {
        isBold: this.htmlPTCollectorService.getIsBold(htmlElements),
        isItalic: this.htmlPTCollectorService.getIsItalic(htmlElements),
        textType: this.selectedTextElement?.metadata.noteTextTypeId,
        headingType: this.selectedTextElement?.metadata.hTypeId,
        isOneRowType: htmlElements.length === 1,
        backgroundColor: this.htmlPTCollectorService.getProperty('backgroundColor', htmlElements),
        color: this.htmlPTCollectorService.getProperty('color', htmlElements),
        ids: htmlElements.map(x => x.getContentId())
      };
      return obj;
    }
    return null;
  }

  ngOnDestroy(): void {
    this.facade.selectionService.resetSelectionAndItems();
    this.muuriService.resetToDefaultOpacity();
    this.leaveNote();
    this.contentEditorElementsListenersService.destroysListeners();
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

    this.initStartTitle(this.title);
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

    this.facade.contentEditorSyncService.onStateSync$.pipe(takeUntil(this.facade.dc.d$))
      .subscribe((flag) => {
        if (flag) {
          this.facade.cdr.detectChanges();
        }
      });

    this.facade.contentUpdateWsService.changes$.pipe(takeUntil(this.facade.dc.d$)).subscribe(() => {
      this.facade.cdr.detectChanges();
      this.handleSelection();
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

    this.contentEditorElementsListenersService.onPressEnterSubject$
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

    this.contentEditorElementsListenersService.onSelectionChangeSubject$
      .pipe(takeUntil(this.facade.dc.d$))
      .subscribe(x => {
        if (x) {
          this.handleSelection();
        }
      })
  }

  handleSelection(): void {
    const selection = this.facade.apiBrowser.getSelection();
    const currentItem = this.getCurrentItem(selection);
    if (currentItem) {
      this.facade.selectionService.selectionTextItemId = currentItem;
      this.facade.selectionService.onSetChanges();
      return;
    }

    this.facade.selectionService.selectionTextItemId = null;
    this.facade.selectionService.onSetChanges();
  }

  getCurrentItem(selection: Selection): string {
    let el = (selection.focusNode as Element);
    while (el) {
      if (el.getAttribute && el.getAttribute('content_id')) {
        return el.getAttribute('content_id');
      }
      el = el.parentElement;
    }
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFocusHandler(content: ParentInteraction<ContentModelBase>): void {
    this.facade.clickableContentService.prevItem?.detectChanges();
  }

  selectionHandler(coords: DrawerCoordsConfig): void {
    this.coords = coords;
    const test = this.selectionDrawer.nativeElement.getBoundingClientRect();
    this.facade.selectionService.selectionHandler(test.x, test.y, test.width, test.height, this.elementsQuery);
  }

  selectionStartHandler(coords: DrawerCoordsConfig): void {
    this.coords = coords;
    const el = this.facade.selectionService.isSelectionInZone(coords.x, coords.y, coords.width, coords.height, this.elementsQuery);
    if (el && el.type === ComponentType.HTML && (el as ParentInteractionHTML).getText()?.length > 0) {
      this.isDrawerVisible$.next(false);
      return;
    }
    this.isDrawerVisible$.next(true);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectionEndHandler(coords: DrawerCoordsConfig): void {
    this.coords = coords;
  }

  getIsSelected(itemId: string): boolean {
    const types = [EditorSelectionModeEnum.DefaultSelectionEmpty, EditorSelectionModeEnum.DefaultSelection, EditorSelectionModeEnum.None];
    if (types.some(x => this.selectionMode === x)) {
      return false;
    }
    return this.facade.selectionService.isSelected(itemId);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onScroll($event: Event): void { }

  enterHandler(value: EnterEvent) {
    const curEl = this.getElementById(value.contentId);
    if (curEl.type === ComponentType.HTML) {
      (curEl as ParentInteractionHTML).syncHtmlWithLayout();
    }
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
    const textLength =  prevElement.getText().length;
    const selection = { start: textLength, end: textLength} as SaveSelection
    if (!prevElement) {
      return;
    }

    const resContent = [...prevElement.getTextBlocks(), ...el.getTextBlocks()];

    const action = new RestoreTextAction(data.content, data.index);
    this.facade.momentoStateService.saveToStack(action);

    prevElement.updateContentsAndSync(resContent, () => prevElement.restoreSelection(selection));
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
    if (!prev || prev.metadata.noteTextTypeId !== NoteTextTypeENUM.numberList) {
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
    const action = new UpdateTextTypeAction(c.id, c.metadata);
    this.facade.momentoStateService.saveToStack(action);
    const selection = content.getSelection();
    this.unSelectItems();
    this.facade.contentEditorTextService.transformTextContentTo(value);
    this.facade.cdr.detectChanges();
    if (selection) {
      selection.start = selection.end;
      const el = this.getHTMLElementById(content.getContentId());
      requestAnimationFrame(() => {
        el.restoreSelection(selection);
        el.setFocusedElement();
        el.detectChanges();
      });
    }
    this.postAction();
  }

  keyDownEventHandler(event: KeyDownHtmlComponent): void {
    if (!event || !event.content) return;
    const c = event.content.getContent();
    const action = new UpdateTextTypeAction(c.id, c.metadata);
    this.facade.momentoStateService.saveToStack(action);
    const selection = event.content.getSelection();
    this.unSelectItems();
    switch (event.key) {
      case KeyboardKeyEnum.Tab: {
        this.facade.contentEditorTextService.updateTabCount(c.id, true);
        break;
      }
      case KeyboardKeyEnum.ShiftTab: {
        this.facade.contentEditorTextService.updateTabCount(c.id, false);
        break;
      }
    }
    this.facade.cdr.detectChanges();
    if (selection) {
      selection.start = selection.end;
      const el = this.getHTMLElementById(event.content.getContentId());
      requestAnimationFrame(() => {
        el.restoreSelection(selection);
        el.setFocusedElement();
        el.detectChanges();
      });
    }
    this.postAction();
  }

  updateTextStyles = (updates: UpdateTextStyles) => {
    const selectionMode = this.selectionMode;
    const elements = this.getHTMLElementsById(updates.ids);
    for (const el of elements) {
      if (!el) {
        this.unSelectItems();
        return;
      }
      const blocks = el.getTextBlocks();
      const html = DeltaConverter.convertTextBlocksToHTML(blocks);
      if (!html) continue;
      const pos = this.getIndexAndLengthForUpdateStyle(selectionMode, el.getEditableNative());
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
    if (this.facade.apiBrowser.isSelectionEmpty()) {
      this.facade.selectionService.resetSelectedItems();
    }
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

  getIndexAndLengthForUpdateStyle(editorSelectionModeEnum: EditorSelectionModeEnum, el: HTMLElement | Element): { index: number; length: number; selection: SaveSelection } {
    if (editorSelectionModeEnum === EditorSelectionModeEnum.DefaultSelection) {
      const selection = this.facade.apiBrowser.getSelectionInfo(el);
      return { index: selection.start, length: selection.end - selection.start, selection };
    }
    return { index: 0, length: el.innerHTML.length, selection: null };
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

  placeHolderClick($event: MouseEvent) {
    if (this.options$.getValue().isReadOnlyMode) {
      return;
    }
    // $event.stopPropagation();
    //$event.preventDefault();
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
