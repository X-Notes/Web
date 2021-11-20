import { ChangeDetectorRef } from "@angular/core";
import { BaseHtmlComponent } from "../base-html-components";

export class CollectionService extends BaseHtmlComponent {
  constructor(cdr: ChangeDetectorRef) {
    super(cdr);
  }
}
