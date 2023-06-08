import { Injectable } from '@angular/core';
import {
  docFormats,
  excelFormats,
  pdfFormats,
  presentationFormats,
} from '../entities-ui/files-enums/type-upload-formats.enum';

@Injectable({
  providedIn: 'root',
})
export class GenericFileExtenstionService {
  documentIcon(name: string) {
    const type = name.split('.').pop().toLowerCase();

    if (docFormats.includes(type)) {
      return 'microsoftWord';
    } else if (excelFormats.includes(type)) {
      return 'microsoftExcel';
    } else if (presentationFormats.includes(type)) {
      return 'microsoftPowerpoint';
    } else if (pdfFormats.includes(type)) {
      return 'pdf';
    }

    return 'fileInner';
  }
}
