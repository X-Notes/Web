import { Injectable, QueryList, Renderer2, RendererFactory2 } from '@angular/core';
import { Subject } from 'rxjs';
import { ParentInteraction } from '../components/parent-interaction.interface';
import { ContentModelBase } from '../entities/contents/content-model-base';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';

@Injectable()
export class ContentEditorElementsListenerService {
  listeners = [];

  onPressDeleteOrBackSpaceSubject = new Subject();

  onPressCtrlZSubject = new Subject();

  onPressCtrlASubject = new Subject();

  onPressCtrlSSubject = new Subject();

  private ctrlAExceptValuesIds = ['title-element', 'search-element'];

  private ctrlAExceptValuesClasses = ['default-text-id', 'collection-title-text-id'];

  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2, private pS: PersonalizationService) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  setHandlers(elements: QueryList<ParentInteraction<ContentModelBase>>) {
    // DELETION
    const keydownBackspace = this.renderer.listen(document, 'keydown.backspace', () => {
      if (this.pS.isDialogActive$.getValue()) {
        return true;
      }
      this.onPressDeleteOrBackSpaceSubject.next();
      for (const el of elements.toArray()) {
        el.backspaceDown();
      }
    });

    const keydownDelete = this.renderer.listen(document, 'keydown.delete', () => {
      if (this.pS.isDialogActive$.getValue()) {
        return true;
      }
      this.onPressDeleteOrBackSpaceSubject.next();
      for (const el of elements.toArray()) {
        el.deleteDown();
      }
    });

    const keydownCtrlZ = this.renderer.listen(document.body, 'keydown', (e: KeyboardEvent) => {
      if (this.pS.isDialogActive$.getValue()) {
        return true;
      }
      if (e.ctrlKey && e.code === 'KeyZ') {
        e.preventDefault();
        this.onPressCtrlZSubject.next();
        return false;
      }
      return true;
    });

    const keydownCtrlA = this.renderer.listen(document.body, 'keydown', (e: KeyboardEvent) => {
      if (this.pS.isDialogActive$.getValue()) {
        return true;
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

    const keydownCtrlS = this.renderer.listen(document.body, 'keydown', (e: KeyboardEvent) => {
      if (this.pS.isDialogActive$.getValue()) {
        return true;
      }
      if (e.ctrlKey && e.code === 'KeyS') {
        e.preventDefault();
        this.onPressCtrlSSubject.next();
        return false;
      }
      return true;
    });

    this.listeners.push(keydownBackspace, keydownDelete, keydownCtrlZ, keydownCtrlA, keydownCtrlS);
  }

  destroysListeners() {
    for (const destroyFunc of this.listeners) {
      destroyFunc();
    }
  }
}
