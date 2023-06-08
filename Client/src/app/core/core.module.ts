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
import { environment } from 'src/environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { UserAPIService } from './user-api.service';
import { TokenInterceptorService } from './token-interceptor.service';
import { ApiServiceLabels } from '../content/labels/api-labels.service';
import { ApiServiceNotes } from '../content/notes/api-notes.service';
import { ApiFoldersService } from '../content/folders/api-folders.service';
import { ApiRelatedNotesService } from '../content/notes/api-related-notes.service';
import { ApiFullFolderService } from '../content/folders/full-folder/services/api-full-folder.service';
import { LockEncryptService } from '../content/notes/lock-encrypt.service';
import { ApiNoteHistoryService } from '../content/notes/full-note/services/api-note-history.service';
import { ApiPersonalizationSettingsService } from './api-personalization-settings.service';
import { UpdaterEntitiesService } from './entities-updater.service';
import { FileApiService } from './file-api.service';
import { AuthService } from './auth.service';
import { ApiBillingService } from './api-billing.service';
import { ApiAudiosService } from '../editor/api/api-audios.service';
import { ApiDocumentsService } from '../editor/api/api-documents.service';
import { ApiPhotosService } from '../editor/api/api-photos.service';
import { ApiTextService } from '../editor/api/api-text.service';
import { ApiVideosService } from '../editor/api/api-videos.service';
import { ApiEditorUsersService } from '../editor/api/api-editor-users.service';

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
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
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
  ],
  providers: [
    AuthService,
    UserAPIService,
    ApiBillingService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true,
    },
    ApiServiceLabels,
    ApiServiceNotes,
    ApiFoldersService,
    ApiRelatedNotesService,
    ApiFullFolderService,
    LockEncryptService,
    ApiNoteHistoryService,
    ApiPersonalizationSettingsService,
    FileApiService,
    UpdaterEntitiesService,
    ApiAudiosService,
    ApiPhotosService,
    ApiDocumentsService,
    ApiEditorUsersService,
    ApiVideosService,
    ApiTextService,
  ],
})
export class CoreModule {}
