import { ChangeDetectorRef } from '@angular/core';

export class BaseHtmlComponent {

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
