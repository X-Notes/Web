import { ElementRef, Injectable, QueryList, Renderer2, RendererFactory2 } from '@angular/core';
import { ParentInteraction } from '../models/parent-interaction.interface';
import { ClickableContentService } from './clickable-content.service';
import { NavigationKeysService } from './navigation-keys.service';

@Injectable()
export class ContentEditorListenerService {
  listeners = [];

  private renderer: Renderer2;

  constructor(
    rendererFactory: RendererFactory2,
    private navigationKeysService: NavigationKeysService,
    private clickableService: ClickableContentService,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  setHandlers(elements: QueryList<ParentInteraction>, noteTitleEl: ElementRef) {
    // KEY UP NAVIGATION

    const keydownArrowUp = this.renderer.listen(document, 'keydown.ArrowUp', (e) => {
      const arr = elements.toArray();
      for (const el of arr) {
        if (el.getContent() === this.navigationKeysService.getContent) {
          const index = arr.indexOf(el);
          if (index === 0) {
            noteTitleEl.nativeElement?.focus();
            break;
          }
          const upEl = arr[index - 1];
          if (upEl) {
            upEl.setFocus();
            break;
          }
        }
      }
    });

    const keydownArrowDown = this.renderer.listen(document, 'keydown.ArrowDown', (e) => {
      const arr = elements.toArray();
      for (const el of arr) {
        if (el.getContent() === this.navigationKeysService.getContent) {
          const index = arr.indexOf(el);
          if (document.activeElement === noteTitleEl.nativeElement) {
            arr[0]?.setFocus();
            break;
          }
          const upDown = arr[index + 1];
          if (upDown) {
            upDown.setFocus();
            break;
          }
        }
      }
    });

    // const source = fromEvent(document, 'keydown');
    // source.subscribe((x) => console.log('222: ', x));

    const click = this.renderer.listen(document, 'click', (e) => {
      this.clickableService.reset();
    });

    this.listeners.push(keydownArrowDown, keydownArrowUp, click);
  }

  destroysListeners() {
    for (const destroyFunc of this.listeners) {
      destroyFunc();
    }
  }
}
