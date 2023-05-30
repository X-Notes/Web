import { TextUpdateResult } from "./text-update-result";

export interface CollectionUpdateResult extends TextUpdateResult {
    fileIds: string[];
}