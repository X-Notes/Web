import { ChangeDetectorRef } from '@angular/core';

export class BaseHtmlComponent {
  protected cdr: ChangeDetectorRef;

  constructor(cdr: ChangeDetectorRef) {
    this.cdr = cdr;
  }

  detectChanges(): void {
    this.cdr.detectChanges();
  }
}
