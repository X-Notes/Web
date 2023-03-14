import { BaseText } from 'src/app/content/notes/models/editor-models/base-text';
import { BlockDiff } from '../../../content-editor/text/entities/diffs/block-diff';

export interface InputHtmlEvent {
  content: BaseText;
  diffs: BlockDiff[];
}
