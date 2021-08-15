import { Injectable } from '@angular/core';
import { LanguagesENUM } from 'src/app/shared/enums/languages.enum';

@Injectable({
  providedIn: 'root'
})
export class SnackBarTranlateHelperService {

  constructor() { }

  getNoAccessRightsTranslate(lname: LanguagesENUM): string{
    switch(lname) {
      case LanguagesENUM.English:{
        return 'No permission to upload files to note ';
      }
      case LanguagesENUM.Russian:{
        return 'Нет разрешения на загрузку файлов для заметок ';
      }
      case LanguagesENUM.Ukraine:{
        return "Немає дозволу завантажувати файли для замітки ";
      }
      default: {
        throw new Error('Inorrect type');
      }
    }
  }

  getNoEnoughMemoryTranslate(lname: LanguagesENUM): string{
    switch(lname) {
      case LanguagesENUM.English:{
        return 'Not enough memory to upload the file';
      }
      case LanguagesENUM.Russian:{
        return 'Недостаточно памяти для загрузки файла';
      }
      case LanguagesENUM.Ukraine:{
        return "Недостатньо пам'яті для завантаження файлу";
      }
      default: {
        throw new Error('Inorrect type');
      }
    }
  }

  getFileTooLargeTranslate(lname: LanguagesENUM, sizeMB: number): string{
    switch(lname) {
      case LanguagesENUM.English:{
        return `File size must not exceed ${sizeMB} MB `;
      }
      case LanguagesENUM.Russian:{
        return `Размер файла не должен превышать ${sizeMB} МБ `;
      }
      case LanguagesENUM.Ukraine:{
        return `Розмір файлу не повинен перевищувати ${sizeMB} МБ`;
      }
      default: {
        throw new Error('Inorrect type');
      }
    }
  }

  getFileNoSupportExtension(lname: LanguagesENUM): string{
    switch(lname) {
      case LanguagesENUM.English:{
        return `File of this format is not supported  `;
      }
      case LanguagesENUM.Russian:{
        return `Файл этого формата не поддерживается `;
      }
      case LanguagesENUM.Ukraine:{
        return `Файл такого формату не підтримується `;
      }
      default: {
        throw new Error('Inorrect type');
      }
    }
  }

}
