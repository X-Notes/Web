import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Theme } from '../enums/Theme';
import { Language } from '../enums/Language';

@Injectable({
  providedIn: 'root'
})
export class PersonalizationService {

  theme: Theme = Theme.Dark;
  language: Language = Language.EN;

  constructor() { }
}
