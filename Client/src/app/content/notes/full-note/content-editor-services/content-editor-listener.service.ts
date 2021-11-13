import { ElementRef, Injectable, QueryList, Renderer2, RendererFactory2 } from '@angular/core';
import { ParentInteraction } from '../models/parent-interaction.interface';
import { FocusDirection } from '../models/set-focus';
import { ClickableContentService } from './clickable-content.service';

@Injectable()
export class ContentEditorListenerService {
  listeners = [];

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

    // const source = fromEvent(document, 'keydown');
    // source.subscribe((x) => console.log('222: ', x));

    const click = this.renderer.listen(document, 'click', () => {
      // this.clickableService.reset(); TODO
    });

    this.listeners.push(keydownArrowDown, keydownArrowUp, click);
  }

  destroysListeners() {
    for (const destroyFunc of this.listeners) {
      destroyFunc();
    }
  }
}
