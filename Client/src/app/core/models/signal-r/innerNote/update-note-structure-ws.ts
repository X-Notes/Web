import { BaseText } from "src/app/content/notes/models/editor-models/base-text";
import { ContentModelBase } from "src/app/content/notes/models/editor-models/content-model-base";
import { UpdateContentPosition } from "./update-content-position-ws";

export class UpdateNoteStructureWS{
    contentIdsToDelete: string[];
    textContentsToAdd: BaseText[];
    photoContentsToAdd: ContentModelBase[];
    videoContentsToAdd: ContentModelBase[];
    audioContentsToAdd: ContentModelBase[];
    documentContentsToAdd: ContentModelBase[];
    positions: UpdateContentPosition[];
}