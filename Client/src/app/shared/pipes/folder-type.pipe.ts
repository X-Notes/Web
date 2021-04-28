import { Pipe, PipeTransform } from '@angular/core';
import { FolderTypeENUM } from '../enums/FolderTypesEnum';

@Pipe({
  name: 'folderType',
})
export class FolderTypePipe implements PipeTransform {
  transform = (value: unknown) => {
    switch (value) {
      case FolderTypeENUM.Private:
        return {
          tranlate: 'subMenu.personal',
          route: '',
        };
      case FolderTypeENUM.Shared:
        return {
          tranlate: 'subMenu.shared',
          route: 'shared',
        };
      case FolderTypeENUM.Archive:
        return {
          tranlate: 'subMenu.archive',
          route: 'archive',
        };
      case FolderTypeENUM.Deleted:
        return {
          tranlate: 'subMenu.bin',
          route: 'deleted',
        };
      default:
        return null;
    }
  };
}
