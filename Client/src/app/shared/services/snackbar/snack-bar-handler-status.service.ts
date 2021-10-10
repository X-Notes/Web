import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { ShowSnackNotification } from 'src/app/core/stateApp/app-action';
import { LanguagesENUM } from '../../enums/languages.enum';
import { OperationResult, OperationResultAdditionalInfo } from '../../models/operation-result.model';
import { SnackBarTranlateHelperService } from './snack-bar-tranlate-helper.service';

@Injectable({
  providedIn: 'root'
})
export class SnackBarHandlerStatusService {

  constructor(private store: Store, private snackbarTranslateHelper: SnackBarTranlateHelperService) { }

  validateStatus(lname: LanguagesENUM, result: OperationResult<any>, fileSize: string){

    if(result.status === OperationResultAdditionalInfo.NoAccessRights){
      const message = this.snackbarTranslateHelper.getNoAccessRightsTranslate(lname); 
      this.store.dispatch(new ShowSnackNotification(message));
      return true;
    }

    if(result.status === OperationResultAdditionalInfo.NotEnoughMemory){
      const message = this.snackbarTranslateHelper.getNoEnoughMemoryTranslate(lname); 
      this.store.dispatch(new ShowSnackNotification(message));
      return true;
    }

    if(result.status === OperationResultAdditionalInfo.FileSizeTooLarge){
      const message = this.snackbarTranslateHelper.getFileTooLargeTranslate(lname, fileSize); 
      this.store.dispatch(new ShowSnackNotification(message));
      return true;
    }

    if(result.status === OperationResultAdditionalInfo.NoSupportExtension){
      const message = this.snackbarTranslateHelper.getFileNoSupportExtension(lname); 
      this.store.dispatch(new ShowSnackNotification(message));
      return true;
    }

    if(result.status === OperationResultAdditionalInfo.NoAnyFile){
      return true;
    }

    return false;
  }

}
