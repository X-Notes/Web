import { Store } from "@ngxs/store";
import { LongTermOperationsHandlerService } from "src/app/content/long-term-operations-handler/services/long-term-operations-handler.service";
import { byteToMB } from "src/app/core/defaults/byte-convert";
import { maxRequestFileSize } from "src/app/core/defaults/constraints";
import { UserStore } from "src/app/core/stateUser/user-state";
import { OperationResult } from "src/app/shared/models/operation-result.model";
import { SnackBarFileProcessHandlerService } from "src/app/shared/services/snackbar/snack-bar-file-process-handler.service";
import { SnackBarHandlerStatusService } from "src/app/shared/services/snackbar/snack-bar-handler-status.service";
import { UploadFilesService } from "src/app/shared/services/upload-files.service";
import { ContentModel } from "../../models/content-model.model";
import { ContentEditorContentsService } from "./content-editor-contents.service";

export class ContentEditorBase {
    
    protected get contents(){
        return this.contentEditorContentsService.contents;
    }

    protected getIndexOrError(contentId: string){
        return this.contentEditorContentsService.getIndexOrError(contentId);
    }

    protected removeItemFromContents(contentId: string){
        this.contentEditorContentsService.contents = this.contentEditorContentsService.contents.filter((x) => x.id !== contentId);
    }

    protected setContentsItem(item: ContentModel, index: number){
        this.contentEditorContentsService.contents[index] = item;
    }

    protected transformContentTo<T extends ContentModel>(result: OperationResult<T>, index: number): void {
        if (result.success) {
          this.setContentsItem(result.data, index);
        } else {
          const lname = this.store.selectSnapshot(UserStore.getUserLanguage);
          this.snackBarStatusTranslateService.validateStatus(lname, result, byteToMB(maxRequestFileSize));
        }
    }
    
    constructor(
        protected store: Store,
        protected snackBarStatusTranslateService: SnackBarHandlerStatusService,
        protected uploadFilesService: UploadFilesService,
        protected longTermOperationsHandler: LongTermOperationsHandlerService,
        protected snackBarFileProcessingHandler: SnackBarFileProcessHandlerService,
        private contentEditorContentsService: ContentEditorContentsService,) {
    }

}