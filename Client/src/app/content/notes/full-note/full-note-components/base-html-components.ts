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

  public cdr: ChangeDetectorRef;

  public selectionService: SelectionService;

  constructor(cdr: ChangeDetectorRef, selectionService: SelectionService) {
    this.cdr = cdr;
    this.selectionService = selectionService;
  }

  get isSelectModeActive(): boolean {
    return this.selectionService.selectionDivActive$.getValue();
  }

  detectChanges(): void {
    this.cdr.detectChanges();
  }

  markForCheck(): void {
    this.cdr.markForCheck();
  }
}
