import { ElementRef, Injectable, QueryList, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ParentInteraction } from '../components/parent-interaction.interface';
import { ContentModelBase } from '../entities/contents/content-model-base';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { EditorOptions } from '../entities-ui/editor-options';
import { FocusDirection } from '../entities-ui/set-focus';
import { ClickableContentService } from './clickable-content.service';
import { ClickableSelectableEntities } from '../entities-ui/clickable-selectable-entities.enum';
import { Store } from '@ngxs/store';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { SelectionService } from './selection.service';
import { EditorSelectionModeEnum } from '../entities-ui/editor-selection-mode.enum';

@Injectable()
export class ContentEditorElementsListenerService {
  listeners = [];

  onPressDeleteOrBackSpaceSubject = new Subject();

  onPressCtrlZSubject = new Subject();

  onPressCtrlASubject = new Subject();

  onPressCtrlSSubject = new Subject();

  onPressTabSubject$ = new Subject();

  onPressEnterSubject$ = new Subject();

  onSelectionChangeSubject$ = new Subject<Event>();

  private ctrlAExceptValuesIds = ['title-element', 'search-element'];

  private ctrlAExceptValuesClasses = ['default-text-id', 'collection-title-text-id'];

  private renderer: Renderer2;

  constructor(
    rendererFactory: RendererFactory2,
    private pS: PersonalizationService,
    private clickableService: ClickableContentService,
    private store: Store,
    private selectionService: SelectionService) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  setHandlers(elements: QueryList<ParentInteraction<ContentModelBase>>, noteTitleEl: ElementRef, options$: BehaviorSubject<EditorOptions>) {

    const keydown = this.renderer.listen(document.body, 'keydown', (e: KeyboardEvent) => {
      if (this.pS.isDialogActive$.getValue() || options$.getValue().isReadOnlyMode) {
        return true;
      }
      if (e.code === 'Backspace' || e.code === 'Delete') {
        this.onPressDeleteOrBackSpaceSubject.next();
        for (const el of elements.toArray()) {
          el.deleteDown();
        }
      }
      if (e.code === 'Enter') {
        e.preventDefault();
        if (this.clickableService?.type !== ClickableSelectableEntities.Text) {
          this.onPressEnterSubject$.next(this.clickableService.currentContent.id);
        }
        return false;
      }
      if (e.code === 'ArrowDown') {
        return this.moveDown(e, noteTitleEl, elements);
      }
      if (e.code === 'ArrowUp') {
        return this.moveUp(e, noteTitleEl, elements);
      }
      if (e.code === 'Tab') {
        e.preventDefault();
        this.onPressTabSubject$.next();
        this.moveDown(e, noteTitleEl, elements);
        return false;
      }
      if (e.ctrlKey && e.code === 'KeyZ') {
        e.preventDefault();
        this.onPressCtrlZSubject.next();
        return false;
      }
      if (e.ctrlKey && e.code === 'KeyS') {
        e.preventDefault();
        this.onPressCtrlSSubject.next();
        return false;
      }
      const htmlEl = e.target as HTMLElement;
      const classes = [...(htmlEl.classList as any)];
      if (e.ctrlKey && e.code === 'KeyA') {
        if (!htmlEl.textContent || htmlEl.textContent === '') {
          e.preventDefault();
          this.onPressCtrlASubject.next();
          return false;
        }
        if (this.ctrlAExceptValuesIds.some((q) => q === htmlEl.id)) {
          return true;
        }
        for (const className of classes) {
          if (this.ctrlAExceptValuesClasses.some((q) => q === className)) {
            return true;
          }
        }
        e.preventDefault();
        this.onPressCtrlASubject.next();
        return false;
      }
      return true;
    });

    const selectionListener = this.renderer.listen(document, 'selectionchange', (e: Event) => {
      if (options$.getValue().isReadOnlyMode || this.store.selectSnapshot(AppStore.IsMuuriDragging)) {
        return true;
      }
      this.onSelectionChangeSubject$.next(e);
    });

    this.listeners.push(keydown, selectionListener);
  }

  moveUp(event: KeyboardEvent, noteTitleEl: ElementRef, elements: QueryList<ParentInteraction<ContentModelBase>>): boolean {

    if (document.activeElement === noteTitleEl.nativeElement) {
      return false;
    }

    const arr = elements.toArray();

    const isMode = this.selectionService.selectionMode === EditorSelectionModeEnum.MultiplyRows || this.selectionService.selectionMode === EditorSelectionModeEnum.EntireRow;
    if (isMode) {
      const elms = arr.filter((item) => this.selectionService.isSelected(item.getContentId()));
      if (elms.length > 0) {
        this.selectionService.resetSelectedItems();
        const minEl = elms.sort((a, b) => a.getContent().order - b.getContent().order)[0];
        minEl.setFocus({ event, itemId: this.clickableService.currentItemId, status: FocusDirection.Up });
      }
      return false;
    }

    const el = arr.find((item) => this.clickableService.isEqual(item.getContent()));
    if (!el) {
      return false;
    }

    const index = arr.indexOf(el);
    const { currentItemId: itemId } = this.clickableService;
    const isFocusToNext = el.isFocusToNext({
      event,
      itemId,
      status: FocusDirection.Up,
    });
    const upEl = isFocusToNext ? arr[index - 1] : el;
    if (index === 0 && isFocusToNext) {
      noteTitleEl.nativeElement?.focus();
      return false;
    }
    if (upEl) {
      upEl.setFocus({ event, itemId, status: FocusDirection.Up });
      el.detectChanges();
    }

    return false;
  }

  moveDown(event: KeyboardEvent, noteTitleEl: ElementRef, elements: QueryList<ParentInteraction<ContentModelBase>>): boolean {
    const arr = elements.toArray();

    const isMode = this.selectionService.selectionMode === EditorSelectionModeEnum.MultiplyRows || this.selectionService.selectionMode === EditorSelectionModeEnum.EntireRow;
    if (isMode) {
      const elms = arr.filter((item) => this.selectionService.isSelected(item.getContentId()));
      if (elms.length > 0) {
        this.selectionService.resetSelectedItems();
        const minEl = elms.sort((a, b) => a.getContent().order - b.getContent().order)[0];
        minEl.setFocus({ event, itemId: this.clickableService.currentItemId, status: FocusDirection.Down });
      }
      return false;
    }

    if (document.activeElement === noteTitleEl.nativeElement) {
      arr[0]?.setFocus({ event, itemId: null, status: FocusDirection.Down });
      return false;
    }

    const el = arr.find((item) => this.clickableService.isEqual(item.getContent()));
    if (!el) {
      return false;
    }

    const index = arr.indexOf(el);

    const upDown = arr[index + 1];
    if (upDown) {
      const { currentItemId: itemId } = this.clickableService;
      const upEl = el.isFocusToNext({
        event,
        itemId,
        status: FocusDirection.Down,
      })
        ? arr[index + 1]
        : el;
      if (upEl) {
        upEl.setFocus({ event, itemId, status: FocusDirection.Down });
        el.detectChanges();
      }
    }

    return false;
  }

  destroysListeners() {
    for (const destroyFunc of this.listeners) {
      destroyFunc();
    }
  }
}
