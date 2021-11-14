import { Injectable, QueryList, Renderer2, RendererFactory2 } from '@angular/core';
import { Subject } from 'rxjs';
import { ParentInteraction } from '../models/parent-interaction.interface';

@Injectable()
export class ContentEditorElementsListenerService {
  listeners = [];

  onPressDeleteOrBackSpaceSubject = new Subject();

  onPressCtrlZSubject = new Subject();
  
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  setHandlers(elements: QueryList<ParentInteraction>) {
    // DELETION
    const keydownBackspace = this.renderer.listen(document, 'keydown.backspace', (e) => {
      this.onPressDeleteOrBackSpaceSubject.next();
      for (const el of elements.toArray()) {
        el.backspaceDown();
      }
    });

    const keydownDelete = this.renderer.listen(document, 'keydown.delete', (e) => {
      this.onPressDeleteOrBackSpaceSubject.next();
      for (const el of elements.toArray()) {
        el.deleteDown();
      }
    });

    const keydownZ = this.renderer.listen(document.body, 'keydown', (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'KeyZ') {
        e.preventDefault();
        this.onPressCtrlZSubject.next();
        return false;
      }
      return true;
    });
    
    this.listeners.push(keydownBackspace, keydownDelete, keydownZ);
  }
 

  destroysListeners() {
    for (const destroyFunc of this.listeners) {
      destroyFunc();
    }
  }
}
