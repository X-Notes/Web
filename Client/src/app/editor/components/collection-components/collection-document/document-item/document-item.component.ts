import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogsManageService } from 'src/app/content/navigation/services/dialogs-manage.service';
import { map } from 'rxjs/operators';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { Observable } from 'rxjs';
import { CollectionCursorUI } from 'src/app/editor/entities-ui/cursors-ui/collection-cursor-ui';
import { DocumentModel } from 'src/app/editor/entities/contents/documents-collection';
import { ClickableContentService } from 'src/app/editor/ui-services/clickable-content.service';
import { GenericFileExtenstionService } from 'src/app/editor/ui-services/generic-file-extenstion.service';
import { SelectionService } from 'src/app/editor/ui-services/selection.service';

@Component({
  selector: 'app-document-item',
  templateUrl: './document-item.component.html',
  styleUrls: ['../../../../styles/inner-card.scss', './document-item.component.scss'],
})
export class DocumentItemComponent {
  @Output()
  clickEvent = new EventEmitter<string>();

  @Output()
  deleteDocument = new EventEmitter<string>();

  @Output()
  exportAudio = new EventEmitter<DocumentModel>();

  @Input() document: DocumentModel;

  @Input() isSelectModeActive = false;

  @Input()
  isReadOnlyMode = false;

  @Input()
  isLoading = false;

  @Input()
  theme: ThemeENUM;

  themeENUM = ThemeENUM;

  @Input()
  uiCursors$: Observable<CollectionCursorUI[]>;

  constructor(
    private readonly clickableService: ClickableContentService,
    private readonly dialogsManageService: DialogsManageService,
    public readonly genericFileExtenstionService: GenericFileExtenstionService,
    public selectionService: SelectionService,
  ) {}

  get isClicked() {
    return this.clickableService.isClicked(this.document.fileId);
  }

  get cursor$(): Observable<CollectionCursorUI> {
    return this.uiCursors$?.pipe(
      map((x) => {
        const array = x.filter((q) => q.itemId === this.document.fileId);
        if (array.length > 0) {
          return array[0];
        }
        return null;
      }),
    );
  }

  openModal(document: DocumentModel) {
    this.dialogsManageService.viewDock(document.documentPath);
  }
}
