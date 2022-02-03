import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { EntityType } from '../shared/enums/entity-types.enum';
import { AppStore } from './stateApp/app-state';
import { UserStore } from './stateUser/user-state';

@Injectable({
  providedIn: 'root',
})
export class HtmlTitleService {
  constructor(
    private store: Store,
    private translateService: TranslateService,
    private titleService: Title,
  ) {}

  init = () => {
    this.store.select(AppStore.getRouting).subscribe(async (route) => this.onRouteChange(route));
    this.store.select(UserStore.getUserLanguage).subscribe(async () => {
      const route = this.store.selectSnapshot(AppStore.getRouting);
      this.onRouteChange(route);
    });
  };

  setCustomOrDefault(custom: string, defaultTitle: string) {
    if (custom && custom.length > 0) {
      this.titleService.setTitle(custom);
    } else {
      this.titleService.setTitle(this.translateService.instant(defaultTitle));
    }
  }

  private onRouteChange(type: EntityType) {
    // TODO REFACTOR
    if (!type) {
      return;
    }
    switch (type) {
      // FOLDER
      case EntityType.FolderPrivate: {
        this.titleService.setTitle(this.translateService.instant('titles.folders'));
        break;
      }
      case EntityType.FolderShared: {
        this.titleService.setTitle(this.translateService.instant('titles.folders'));
        break;
      }
      case EntityType.FolderArchive: {
        this.titleService.setTitle(this.translateService.instant('titles.folders'));
        break;
      }
      case EntityType.FolderDeleted: {
        this.titleService.setTitle(this.translateService.instant('titles.folders'));
        break;
      }
      case EntityType.FolderInner: {
        break;
      }
      case EntityType.FolderInnerNote: {
        break;
      }

      // NOTES
      case EntityType.NotePrivate: {
        this.titleService.setTitle(this.translateService.instant('titles.notes'));
        break;
      }
      case EntityType.NoteShared: {
        this.titleService.setTitle(this.translateService.instant('titles.notes'));
        break;
      }
      case EntityType.NoteArchive: {
        this.titleService.setTitle(this.translateService.instant('titles.notes'));
        break;
      }
      case EntityType.NoteDeleted: {
        this.titleService.setTitle(this.translateService.instant('titles.notes'));
        break;
      }
      case EntityType.NoteInner: {
        break;
      }

      // LABELS
      case EntityType.LabelPrivate: {
        this.titleService.setTitle(this.translateService.instant('titles.labels'));
        break;
      }
      case EntityType.LabelDeleted: {
        this.titleService.setTitle(this.translateService.instant('titles.labels'));
        break;
      }

      // PROFILE
      case EntityType.Profile: {
        this.titleService.setTitle(this.translateService.instant('titles.profile'));
        break;
      }

      case EntityType.History: {
        this.titleService.setTitle(this.translateService.instant('titles.history'));
        break;
      }

      default: {
        throw new Error('error');
      }
    }
  }
}
