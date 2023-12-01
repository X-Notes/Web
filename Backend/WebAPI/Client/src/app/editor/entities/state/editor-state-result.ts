import { ContentModelBase } from "../contents/content-model-base";

export interface EditorStateResult {
    idsToDelete: string[];
    contentsToAdd: ContentModelBase[];
    contentsToUpdate: ContentModelBase[];
}