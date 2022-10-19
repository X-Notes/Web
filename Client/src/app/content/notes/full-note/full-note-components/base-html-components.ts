import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  template: '',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export abstract class BaseEditorElementComponent {
  @Input()
  isSelectModeActive$: Observable<boolean>;

  @Input()
  isReadOnlyMode = false;

  @Input()
  isSelected = false;

  @Output()
  someChangesEvent = new EventEmitter();

  @Output()
  runDetectChangesChildren = new EventEmitter();

  public isMouseOver = false;

  public cdr: ChangeDetectorRef;

  constructor(cdr: ChangeDetectorRef) {
    this.cdr = cdr;
  }

  detectChanges(): void {
    this.cdr.detectChanges();
  }

  markForCheck(): void {
    this.cdr.markForCheck();
  }
}
