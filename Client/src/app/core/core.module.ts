import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import {
  TranslateLoader,
  TranslateModule,
  MissingTranslationHandler,
  MissingTranslationHandlerParams,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// Auth
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { UserAPIService } from './user-api.service';
import { TokenInterceptorService } from './token-interceptor.service';
import { ApiServiceLabels } from '../content/labels/api-labels.service';
import { ApiServiceNotes } from '../content/notes/api-notes.service';
import { ApiFoldersService } from '../content/folders/api-folders.service';
import { AppServiceAPI } from './app.service';
import { ApiRelatedNotesService } from '../content/notes/api-related-notes.service';
import { ApiFullFolderService } from '../content/folders/full-folder/services/api-full-folder.service';
import { LockEncryptService } from '../content/notes/lock-encrypt.service';
import { ApiNoteHistoryService } from '../content/notes/api-note-history.service';

export const HttpLoaderFactory = (http: HttpClient) => {
  return new TranslateHttpLoader(http, './assets/locale/', '.json');
};
export class MissingTranslationService implements MissingTranslationHandler {
  handle = (params: MissingTranslationHandlerParams) => {
    return `WARN: '${params.key}' is missing in '${params.translateService.currentLang}' locale`;
  };
}

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslationService,
      },
      useDefaultLang: false,
    }),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
  ],
  providers: [
    AuthService,
    UserAPIService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true,
    },
    ApiServiceLabels,
    ApiServiceNotes,
    ApiFoldersService,
    AppServiceAPI,
    ApiRelatedNotesService,
    ApiFullFolderService,
    LockEncryptService,
    ApiNoteHistoryService,
  ],
})
export class CoreModule {}
