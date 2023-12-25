import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { NgxsModule, Store } from '@ngxs/store';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { LabelStore } from './content/labels/state/labels-state';
import { ContentModule } from './content/content.module';
import { NoteStore } from './content/notes/state/notes-state';
import { UserStore } from './core/stateUser/user-state';
import { FolderStore } from './content/folders/state/folders-state';
import { AppStore } from './core/stateApp/app-state';
import { BackgroundStore } from './core/backgrounds/background-state';
import { SharedPublicModule } from './public/shared-public/shared-public/shared-public.module';
import { PersonalizationService } from './shared/services/personalization.service';
import { AuthService } from './core/auth.service';

function initializeAppFactory(store: Store, authService: AuthService): () => Promise<any> {
  return async () => {
    const landingAuthDate = localStorage.getItem('landing_auth_date');
    if(landingAuthDate) {
      const end = new Date(new Date().toISOString());      
      const diff = end.getTime() - new Date(landingAuthDate).getTime();
      const seconds = Math.ceil(diff / 1000);
      if(seconds <= 5) {
        const landing_auth_at = localStorage.getItem('landing_auth_at');
        const landing_auth_ft = localStorage.getItem('landing_auth_ft');
        if(landing_auth_at && landing_auth_ft) {
          await authService.login(landing_auth_at, landing_auth_ft);
          return true;
        }
      }
    }
    if(!store.selectSnapshot(UserStore.isLogged)) {
      return true;
    }
    return await authService.refresh();
  }
 }


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: false }),
    SharedPublicModule,
    ContentModule,
    NgxsModule.forRoot([LabelStore, NoteStore, UserStore, BackgroundStore, FolderStore, AppStore], {
      developmentMode: !environment.production,
    }),
    NgxsStoragePluginModule.forRoot({
      key: UserStore,
    }),
    SharedModule,
  ],
  bootstrap: [AppComponent],
  providers: [{
    provide: APP_INITIALIZER,
    useFactory: initializeAppFactory,
    deps: [Store, AuthService],
    multi: true
  }, PersonalizationService]
})
export class AppModule { }
