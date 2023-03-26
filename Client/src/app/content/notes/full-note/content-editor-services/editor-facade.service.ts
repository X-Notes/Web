import { ChangeDetectorRef, Injectable } from '@angular/core';
import { Actions, Store } from '@ngxs/store';
import { HtmlTitleService } from 'src/app/core/html-title.service';
import { DestroyComponentService } from 'src/app/shared/services/destroy-component.service';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import { ClickableContentService } from './clickable-content.service';
import { ContentUpdateWsService } from './content-update-ws.service';
import { ContentEditorRestoreService } from './core/content-editor-restore.service';
import { ContentEditorSyncService } from './core/content-editor-sync.service';
import { SelectionService } from './selection.service';
import { ContentEditorTextService } from './text-content/content-editor-text.service';

@Injectable()
export class EditorFacadeService {
  constructor(
    public store: Store,
    public htmlTitleService: HtmlTitleService,
    public dc: DestroyComponentService,
    public apiBrowser: ApiBrowserTextService,
    public actions$: Actions,
    public cdr: ChangeDetectorRef,
    public selectionService: SelectionService,
    public contentUpdateWsService: ContentUpdateWsService,
    public contentEditorSyncService: ContentEditorSyncService,
    public contentEditorRestoreService: ContentEditorRestoreService,
    public contentEditorTextService: ContentEditorTextService,
    public clickableContentService: ClickableContentService,
  ) {}
}
