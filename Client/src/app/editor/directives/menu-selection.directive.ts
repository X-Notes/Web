import { Directive, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ParentInteraction, ParentInteractionHTML } from '../components/parent-interaction.interface';
import { SelectionService } from '../ui-services/selection.service';
import { ApiBrowserTextService } from 'src/app/content/notes/api-browser-text.service';
import { ContentModelBase } from '../entities/contents/content-model-base';
import { BehaviorSubject } from 'rxjs';
import { EditorOptions } from '../entities-ui/editor-options';

@Directive({
  selector: '[appMenuSelection]',
})
export class MenuSelectionDirective implements OnDestroy, OnInit {
  @Input() appMenuSelection: ParentInteractionHTML[];

  @Input() editorOptions$: BehaviorSubject<EditorOptions>;

  @Input() scrollElement: HTMLElement;

  listeners = [];

  constructor(
    private renderer: Renderer2,
    public apiBrowserService: ApiBrowserTextService,
    public selectionService: SelectionService,
  ) {}

  ngOnInit(): void {
    const mouseupListener = this.renderer.listen(document, 'selectionchange', () => {
      if (this.editorOptions$.getValue().isReadOnlyMode) {
        return true;
      }
      this.onSelectionchange();
    }
    );
    this.listeners.push(mouseupListener);
  }

  onSelectionchange(clearIfEmpty = false) {
    const selection = this.apiBrowserService.getSelection();
    const selectionEmpty = selection.toString() === '';
    if (!selectionEmpty) {
      const range = selection.getRangeAt(0);
      const coords = range.getBoundingClientRect();
      const currentItem = this.getCurrentItem();
      if (currentItem) {
        this.selectionService.initSingle(currentItem.getContentId(), this.scrollElement, coords);
      }
    }
    if (clearIfEmpty && selectionEmpty) {
      this.selectionService.resetSelectionItems();
    }
  }

  getCurrentItem(): ParentInteraction<ContentModelBase> {
    for (const item of this.appMenuSelection) {
      if (item.getEditableNative() === document.activeElement) {
        return item;
      }
    }
    return null;
  }

  ngOnDestroy(): void {
    for (const destroyFunc of this.listeners) {
      destroyFunc();
    }
  }
}
