import { ChangeDetectorRef, Injectable } from '@angular/core';
import { Actions, Store } from '@ngxs/store';
import { ApiBrowserTextService } from 'src/app/content/notes/api-browser-text.service';
import { HtmlTitleService } from 'src/app/core/html-title.service';
import { DestroyComponentService } from 'src/app/shared/services/destroy-component.service';
import { ClickableContentService } from '../ui-services/clickable-content.service';
import { ContentEditorContentsService } from '../ui-services/contents/content-editor-contents.service';
import { ContentEditorMomentoStateService } from '../ui-services/contents/content-editor-momento-state.service';
import { ContentEditorRestoreService } from '../ui-services/contents/content-editor-restore.service';
import { ContentEditorTextService } from '../ui-services/contents/content-editor-text.service';
import { SelectionService } from '../ui-services/selection.service';
import { ContentEditorAudiosCollectionService } from './collections/content-editor-audios.service';
import { ContentEditorDocumentsCollectionService } from './collections/content-editor-documents.service';
import { ContentEditorPhotosCollectionService } from './collections/content-editor-photos.service';
import { ContentEditorVideosCollectionService } from './collections/content-editor-videos.service';
import { ContentEditorSyncService } from './content-editor-sync.service';
import { ContentUpdateWsService } from './content-update-ws.service';

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
    public momentoStateService: ContentEditorMomentoStateService,
    public contentsService: ContentEditorContentsService,
    public photosService: ContentEditorPhotosCollectionService,
    public documentsService: ContentEditorDocumentsCollectionService,
    public videosService: ContentEditorVideosCollectionService,
    public audiosService: ContentEditorAudiosCollectionService,
  ) {}
}
