import { Component, QueryList, ViewChildren } from '@angular/core';
import { FolderService } from './folder.service';
import { FolderComponent } from './folder/folder.component';

@Component({
  template: '',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class BaseFoldersComponent {
  constructor(public folderService: FolderService) {}

  @ViewChildren(FolderComponent) set viewFolderChildren(elms: QueryList<FolderComponent>) {
    this.folderService.viewElements = elms;
  }
}
