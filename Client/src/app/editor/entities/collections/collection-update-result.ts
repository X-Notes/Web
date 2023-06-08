import { TextUpdateResult } from "../text/text-update-result";

export interface CollectionUpdateResult extends TextUpdateResult {
    fileIds: string[];
}