import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { UploadFileToEntity } from "../../models/upload-files-to-entity";
import { BaseHtmlComponent } from "../base-html-components";
import { TitleCollectionComponent } from "../collection-components/title-collection/title-collection.component";

@Component({
  template: '',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class CollectionService extends BaseHtmlComponent {
  @Output()
  changeTitleEvent = new EventEmitter<string>();
  
  @Output()
  uploadEvent = new EventEmitter<UploadFileToEntity>();

  @Output()
  deleteContentEvent = new EventEmitter<string>();

  @Input()
  isReadOnlyMode = false;

  @Input()
  isSelected = false;
  
  @ViewChild(TitleCollectionComponent) titleComponent: TitleCollectionComponent;
  
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(cdr: ChangeDetectorRef) {
    super(cdr);
  }

  syncHtmlWithLayout() {
    // TODO
  }
}
