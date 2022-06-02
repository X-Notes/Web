import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';

@Component({
  template: '',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class BaseHtmlComponent {
  @Output()
  someChangesEvent = new EventEmitter();

  public isMouseOver = false;

  protected cdr: ChangeDetectorRef;

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
