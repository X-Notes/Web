import { Injectable } from '@angular/core';
import { LanguagesENUM } from 'src/app/shared/enums/languages.enum';

@Injectable({
  providedIn: 'root',
})
export class SnackBarTranlateHelperService {
  getNoAccessRightsTranslate = (lname: LanguagesENUM): string => {
    switch (lname) {
      case LanguagesENUM.en: {
        return 'No permission to upload files to note ';
      }
      case LanguagesENUM.ru: {
        return 'Нет разрешения на загрузку файлов для заметок ';
      }
      case LanguagesENUM.uk: {
        return 'Немає дозволу завантажувати файли для замітки ';
      }
      default: {
        throw new Error('Inorrect type');
      }
    }
  };

  getNoEnoughMemoryTranslate = (lname: LanguagesENUM): string => {
    // TODO MOVE TO i18
    switch (lname) {
      case LanguagesENUM.en: {
        return 'Not enough memory to upload the file';
      }
      case LanguagesENUM.ru: {
        return 'Недостаточно памяти для загрузки файла';
      }
      case LanguagesENUM.uk: {
        return "Недостатньо пам'яті для завантаження файлу";
      }
      default: {
        throw new Error('Inorrect type');
      }
    }
  };

  getFileTooLargeTranslate = (lname: LanguagesENUM, sizeMB: string): string => {
    // TODO MOVE TO i18
    switch (lname) {
      case LanguagesENUM.en: {
        return `File size must not exceed ${sizeMB} MB `;
      }
      case LanguagesENUM.ru: {
        return `Размер файла не должен превышать ${sizeMB} МБ `;
      }
      case LanguagesENUM.uk: {
        return `Розмір файлу не повинен перевищувати ${sizeMB} МБ`;
      }
      default: {
        throw new Error('Inorrect type');
      }
    }
  };

  getFileNoSupportExtension = (lname: LanguagesENUM): string => {
    // TODO MOVE TO i18
    switch (lname) {
      case LanguagesENUM.en: {
        return `File of this format is not supported  `;
      }
      case LanguagesENUM.ru: {
        return `Файл этого формата не поддерживается `;
      }
      case LanguagesENUM.uk: {
        return `Файл такого формату не підтримується `;
      }
      default: {
        throw new Error('Inorrect type');
      }
    }
  };
}
