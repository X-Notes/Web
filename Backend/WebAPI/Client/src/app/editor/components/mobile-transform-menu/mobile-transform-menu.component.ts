import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { HeadingTypeENUM } from '../../entities/contents/text-models/heading-type.enum';
import { NoteTextTypeENUM } from '../../entities/contents/text-models/note-text-type.enum';
import { ClickableContentService } from '../../ui-services/clickable-content.service';
import { TypeUploadFile } from '../../entities-ui/files-enums/type-upload-file.enum';
import { TypeUploadFormats } from '../../entities-ui/files-enums/type-upload-formats.enum';
import { TransformContent } from '../../entities-ui/transform-content.model';
import { TransformToFileContent } from '../../entities-ui/transform-file-content.model';

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
      contentId,
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
