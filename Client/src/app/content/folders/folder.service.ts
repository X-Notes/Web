import { Injectable } from '@angular/core';
import { UpdateColor } from '../notes/state/updateColor';
import { Folder } from './models/folder';

@Injectable()
export class FolderService {

  constructor() { }

  changeColorHandler( folders: Folder[], updateColor: UpdateColor[]) {
    for (const update of updateColor) {
      folders.find(x => x.id === update.id).color = update.color;
    }
  }
}
