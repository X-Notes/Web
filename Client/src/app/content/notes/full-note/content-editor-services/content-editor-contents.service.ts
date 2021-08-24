import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { ContentModel } from '../../models/content-model.model';

@Injectable({
  providedIn: 'root'
})
export class ContentEditorContentsService {

  contents: ContentModel[]; // TODO MAKE DICTIONARY

  constructor(        
    protected store: Store,
    protected snackBarStatusTranslateService: SnackBarHandlerStatusService,) { }


  getIndexOrError(contentId: string) {
    const index = this.contents.findIndex((x) => x.id === contentId);
    if (index !== -1) {
      return index;
    }
    throw new Error('Not found');
  }

  getContentWithType<T extends ContentModel>(index: number): T {
    return this.contents[index] as T;
  }
  
}
