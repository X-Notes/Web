import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { SelectionService } from '../content-editor-services/selection.service';

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

  constructor(public cdr: ChangeDetectorRef, public selectionService: SelectionService) {
    this.cdr = cdr;
    this.selectionService = selectionService;
  }

  get isSelectModeActive(): boolean {
    return this.selectionService._selectionDivActive$.getValue();
  }

  detectChanges(): void {
    this.cdr.detectChanges();
  }

  markForCheck(): void {
    this.cdr.markForCheck();
  }
}
