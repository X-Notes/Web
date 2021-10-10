import { Injectable, QueryList, Renderer2, RendererFactory2 } from '@angular/core';
import { ParentInteraction } from '../models/parent-interaction.interface';

@Injectable()
export class ContentEditorElementsListenerService {
  listeners = [];

  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  setHandlers(elements: QueryList<ParentInteraction>) {
    // DELETION
    const keydownBackspace = this.renderer.listen(document, 'keydown.backspace', (e) => {
      for (const el of elements.toArray()) {
        el.backspaceDown();
      }
    });

    const keydownDelete = this.renderer.listen(document, 'keydown.delete', (e) => {
      for (const el of elements.toArray()) {
        el.deleteDown();
      }
    });

    const keyupBackspace = this.renderer.listen(document, 'keyup.backspace', (e) => {
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
