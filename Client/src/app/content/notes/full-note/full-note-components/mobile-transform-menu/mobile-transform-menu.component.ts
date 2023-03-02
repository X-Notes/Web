import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ClickableContentService } from '../../content-editor-services/clickable-content.service';
import { HeadingTypeENUM } from '../../content-editor/text/heading-type.enum';
import { NoteTextTypeENUM } from '../../content-editor/text/note-text-type.enum';
import { TypeUploadFile } from '../../models/enums/type-upload-file.enum';
import { TypeUploadFormats } from '../../models/enums/type-upload-formats.enum';
import { TransformContent } from '../../models/transform-content.model';
import { TransformToFileContent } from '../../models/transform-file-content.model';

@Component({
  selector: 'app-mobile-transform-menu',
  templateUrl: './mobile-transform-menu.component.html',
  styleUrls: ['./mobile-transform-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileTransformMenuComponent implements OnInit {
  @ViewChild('uploadFile') uploadFile: ElementRef;

  @Output()
  transformToFile = new EventEmitter<TransformToFileContent>();

  @Output()
  transformTo = new EventEmitter<TransformContent>();

  textType = NoteTextTypeENUM;

  isMultiply = false;

  headingType = HeadingTypeENUM;

  typeUpload = TypeUploadFile;

  formats: string;

  constructor(private clickableContentService: ClickableContentService) {}

  ngOnInit(): void {}

  preventClick = ($event) => {
    $event.preventDefault();
  };

  transformContent($event, contentType: NoteTextTypeENUM, heading?: HeadingTypeENUM) {
    const contentId = this.clickableContentService.getTextContentIdOrNull();
    if (!contentId) return;
    $event.preventDefault();
    this.transformTo.emit({
      id: contentId,
      textType: contentType,
      headingType: heading,
      setFocusToEnd: true,
    });
  }

  transformToFileHandler($event, type: TypeUploadFile, isMultiply: boolean) {
    $event.preventDefault();
    this.isMultiply = isMultiply;
    this.uploadFile.nativeElement.uploadType = type;
    this.formats = TypeUploadFormats[TypeUploadFile[type]];
    setTimeout(() => this.uploadFile.nativeElement.click());
  }

  uploadFiles(event) {
    const contentId = this.clickableContentService.getTextContentIdOrNull();
    if (!contentId) return;
    const type = this.uploadFile.nativeElement.uploadType as TypeUploadFile;
    const files = event.target.files as File[];
    this.transformToFile.emit({ contentId, typeFile: type, files: [...files] });
  }
}
