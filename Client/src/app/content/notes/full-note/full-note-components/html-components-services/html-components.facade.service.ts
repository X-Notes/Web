import { Injectable, Renderer2 } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import { DestroyComponentService } from 'src/app/shared/services/destroy-component.service';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { ApiBrowserTextService } from '../../../api-browser-text.service';
import { ClickableContentService } from '../../content-editor-services/clickable-content.service';
import { ContentEditorMomentoStateService } from '../../content-editor-services/core/content-editor-momento-state.service';
import { SelectionService } from '../../content-editor-services/selection.service';

@Injectable()
export class HtmlComponentsFacadeService {
  constructor(
    public apiBrowserTextService: ApiBrowserTextService,
    public pS: PersonalizationService,
    public selectionService: SelectionService,
    public clickableService: ClickableContentService,
    public renderer: Renderer2,
    public sanitizer: DomSanitizer,
    public store: Store,
    public dc: DestroyComponentService,
    public momentoStateService: ContentEditorMomentoStateService,
  ) {}
}
