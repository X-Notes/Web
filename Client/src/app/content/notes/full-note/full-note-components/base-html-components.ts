import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { HtmlComponentsFacadeService } from '../content-editor/services/html-facade.service';

@Component({
  template: '',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export abstract class BaseEditorElementComponent {
  @Input()
  isReadOnlyMode = false;

  @Input()
  isSelected = false;

  @Output()
  someChangesEvent = new EventEmitter();

  public isMouseOver = false;

  constructor(public cdr: ChangeDetectorRef, public facade: HtmlComponentsFacadeService) {
    this.cdr = cdr;
  }

  get isSelectModeActive(): boolean {
    // eslint-disable-next-line no-underscore-dangle
    return this.facade.selectionService.selectionDivActive$.getValue();
  }

  detectChanges(): void {
    this.cdr.detectChanges();
  }

  markForCheck(): void {
    this.cdr.markForCheck();
  }
}
