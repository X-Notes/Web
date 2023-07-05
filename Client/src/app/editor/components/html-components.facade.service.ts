import { Injectable, Renderer2 } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import { DestroyComponentService } from 'src/app/shared/services/destroy-component.service';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';

import { SelectionService } from '../ui-services/selection.service';
import { ContentEditorTextService } from '../ui-services/contents/content-editor-text.service';
import { ApiBrowserTextService } from 'src/app/content/notes/api-browser-text.service';
import { ClickableContentService } from '../ui-services/clickable-content.service';
import { ContentEditorMomentoStateService } from '../ui-services/contents/content-editor-momento-state.service';
import { ContentEditorContentsService } from '../ui-services/contents/content-editor-contents.service';

@Injectable()
export class HtmlComponentsFacadeService {
  constructor(
    public apiBrowser: ApiBrowserTextService,
    public pS: PersonalizationService,
    public selectionService: SelectionService,
    public clickableService: ClickableContentService,
    public renderer: Renderer2,
    public sanitizer: DomSanitizer,
    public store: Store,
    public dc: DestroyComponentService,
    public momentoStateService: ContentEditorMomentoStateService,
    public contentEditorTextService: ContentEditorTextService,
    public contentEditorContent: ContentEditorContentsService,
  ) {}
}
