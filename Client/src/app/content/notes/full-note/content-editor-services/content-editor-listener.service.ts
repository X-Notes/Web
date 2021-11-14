import { ElementRef, Injectable, QueryList, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ParentInteraction } from '../models/parent-interaction.interface';
import { FocusDirection } from '../models/set-focus';
import { ClickableContentService } from './clickable-content.service';
import { ClickableSelectableEntities } from './clickable-selectable-entities.enum';

@Injectable()
export class ContentEditorListenerService {
  listeners = [];

  onPressEnterSubject = new BehaviorSubject<string>(null);

  private renderer: Renderer2;

  constructor(
    rendererFactory: RendererFactory2,
    private clickableService: ClickableContentService,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  setHandlers(elements: QueryList<ParentInteraction>, noteTitleEl: ElementRef) {
    // KEY UP NAVIGATION

    const keydownArrowUp = this.renderer.listen(document, 'keydown.ArrowUp', (e) => {
      const arr = elements.toArray();
      const el = arr.find((item) => this.clickableService.isEqual(item.getContent()));
      if (el) {
        const index = arr.indexOf(el);
        if (index === 0) {
          noteTitleEl.nativeElement?.focus();
          return;
        }
        const { currentItemId: itemId } = this.clickableService;
        const upEl = el.isFocusToNext({ itemId, status: FocusDirection.Up }) ? arr[index - 1] : el;
        if (upEl) {
          upEl.setFocus({ itemId, status: FocusDirection.Up });
        }
      }
    });

    const keydownArrowDown = this.renderer.listen(document, 'keydown.ArrowDown', (e) => {
      const arr = elements.toArray();

      if (document.activeElement === noteTitleEl.nativeElement) {
        arr[0]?.setFocus();
        return;
      }

      const el = arr.find((item) => this.clickableService.isEqual(item.getContent()));
      if (el) {
        const index = arr.indexOf(el);

        const upDown = arr[index + 1];
        if (upDown) {
          const { currentItemId: itemId } = this.clickableService;
          const upEl = el.isFocusToNext({ itemId, status: FocusDirection.Down })
            ? arr[index + 1]
            : el;
          if (upEl) {
            upEl.setFocus({ itemId, status: FocusDirection.Down });
          }
        }
      }
    });

    const keydownEnter = this.renderer.listen(document, 'keydown.enter', (e: KeyboardEvent) => {
      e.preventDefault();
      if (this.clickableService?.type !== ClickableSelectableEntities.Text) {
        this.onPressEnterSubject.next(this.clickableService.currentContentId);
      }
      return false;
    });

    this.listeners.push(keydownArrowDown, keydownArrowUp, keydownEnter);
  }

  destroysListeners() {
    for (const destroyFunc of this.listeners) {
      destroyFunc();
    }
  }
}
