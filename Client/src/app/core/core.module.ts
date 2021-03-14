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
  ],
})
export class CoreModule {}
