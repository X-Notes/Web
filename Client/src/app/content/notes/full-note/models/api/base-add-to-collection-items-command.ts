export class BaseAddToCollectionItemsCommand {
    constructor(public noteId: string, public contentId: string, public fileIds: string[]){
        
    }
}