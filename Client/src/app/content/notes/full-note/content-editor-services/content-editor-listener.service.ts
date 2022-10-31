import { ElementRef, Injectable, QueryList, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ParentInteraction } from '../models/parent-interaction.interface';
import { FocusDirection } from '../models/set-focus';
import { ClickableContentService } from './clickable-content.service';
import { ClickableSelectableEntities } from './models/clickable-selectable-entities.enum';

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

  setHandlers(
    elements: QueryList<ParentInteraction>,
    noteTitleEl: ElementRef,
    contentSection: ElementRef<HTMLElement>,
  ) {
    // KEY UP NAVIGATION

    const keydownArrowUp = this.renderer.listen(
      document,
      'keydown.ArrowUp',
      (event: KeyboardEvent) => {
        if (document.activeElement === noteTitleEl.nativeElement) {
          return;
        }

        const arr = elements.toArray();
        const el = arr.find((item) => this.clickableService.isEqual(item.getContent()));
        if (el) {
          const index = arr.indexOf(el);
          const { currentItemId: itemId } = this.clickableService;
          const isFocusToNext = el.isFocusToNext({
            contentSection,
            event,
            itemId,
            status: FocusDirection.Up,
          });
          const upEl = isFocusToNext ? arr[index - 1] : el;
          if (index === 0 && isFocusToNext) {
            noteTitleEl.nativeElement?.focus();
            el.detectChanges();
            return;
          }
          if (upEl) {
            upEl.setFocus({ contentSection, event, itemId, status: FocusDirection.Up });
            el.detectChanges();
          }
        }
      },
    );

    const keydownArrowDown = this.renderer.listen(
      document,
      'keydown.ArrowDown',
      (event: KeyboardEvent) => {
        const arr = elements.toArray();

        if (document.activeElement === noteTitleEl.nativeElement) {
          arr[0]?.setFocus({ contentSection, event, itemId: null, status: FocusDirection.Down });
          return;
        }

        const el = arr.find((item) => this.clickableService.isEqual(item.getContent()));
        if (el) {
          const index = arr.indexOf(el);

          const upDown = arr[index + 1];
          if (upDown) {
            const { currentItemId: itemId } = this.clickableService;
            const upEl = el.isFocusToNext({
              contentSection,
              event,
              itemId,
              status: FocusDirection.Down,
            })
              ? arr[index + 1]
              : el;
            if (upEl) {
              upEl.setFocus({ contentSection, event, itemId, status: FocusDirection.Down });
              el.detectChanges();
            }
          }
        }
      },
    );

    const keydownEnter = this.renderer.listen(document, 'keydown.enter', (e: KeyboardEvent) => {
      e.preventDefault();
      if (this.clickableService?.type !== ClickableSelectableEntities.Text) {
        this.onPressEnterSubject.next(this.clickableService.currentContent.id);
      }
      return false;
    });

    this.listeners.push(keydownArrowDown, keydownArrowUp, keydownEnter);
  }

  destroysListeners() {
    for (const destroyFunc of this.listeners) {
      destroyFunc();
    }
    this.onPressEnterSubject.next(null);
  }
}
