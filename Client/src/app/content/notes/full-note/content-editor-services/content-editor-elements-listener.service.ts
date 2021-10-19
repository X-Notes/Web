import { Injectable, QueryList, Renderer2, RendererFactory2 } from '@angular/core';
import { Subject } from 'rxjs';
import { ParentInteraction } from '../models/parent-interaction.interface';

@Injectable()
export class ContentEditorElementsListenerService {
  listeners = [];

  private renderer: Renderer2;

  onClickDeleteOrBackSpaceSubject = new Subject();

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  setHandlers(elements: QueryList<ParentInteraction>) {
    // DELETION
    const keydownBackspace = this.renderer.listen(document, 'keydown.backspace', (e) => {
      this.onClickDeleteOrBackSpaceSubject.next();
      for (const el of elements.toArray()) {
        el.backspaceDown();
      }
    });

    const keydownDelete = this.renderer.listen(document, 'keydown.delete', (e) => {
      this.onClickDeleteOrBackSpaceSubject.next();
      for (const el of elements.toArray()) {
        el.deleteDown();
      }
    });

    const keyupBackspace = this.renderer.listen(document, 'keyup.backspace', (e) => {
      this.onClickDeleteOrBackSpaceSubject.next();
      for (const el of elements.toArray()) {
        el.backspaceUp();
      }
    });

    this.listeners.push(keydownBackspace, keyupBackspace, keydownDelete);
  }

  destroysListeners() {
    for (const destroyFunc of this.listeners) {
      destroyFunc();
    }
  }
}
