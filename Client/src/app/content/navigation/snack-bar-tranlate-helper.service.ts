import { Injectable } from '@angular/core';
import { LanguagesENUM } from 'src/app/shared/enums/languages.enum';

@Injectable({
  providedIn: 'root'
})
export class SnackBarTranlateHelperService {

  constructor() { }

  
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
}
