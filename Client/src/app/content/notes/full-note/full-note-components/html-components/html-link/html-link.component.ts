import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { LanguagesENUM } from 'src/app/shared/enums/languages.enum';
import { SnackBarWrapperService } from 'src/app/shared/services/snackbar/snack-bar-wrapper.service';
import { ApiBrowserTextService } from '../../../../api-browser-text.service';
import { ApiServiceNotes } from '../../../../api-notes.service';

@Component({
  selector: 'app-html-link',
  templateUrl: './html-link.component.html',
  styleUrls: ['../../styles/inner-card.scss', './html-link.component.scss'],
})
export class HtmlLinkComponent implements OnInit, OnDestroy {
  @Input() link: string;

  @Input()
  isReadOnlyMode = false;

  @ViewChild(MatMenu) menu: MatMenu;

  destroy = new Subject<void>();

  data = {
    title: null,
    image: null,
  };

  isLoaded = false;

  constructor(
    private api: ApiServiceNotes,
    private apiBrowserService: ApiBrowserTextService,
    private snackService: SnackBarWrapperService,
    private store: Store,
  ) {}

  ngOnInit() {
    this.data.title = '';
    this.data.image = '';
    if (!this.data.image) {
      this.isLoaded = true;
    }
  }

  openNewTab() {
    window.open(this.link, '_blank');
  }

  copyToBuffer = () => {
    const language = this.store.selectSnapshot(UserStore.getUserLanguage);
    this.apiBrowserService.copyText(this.link);
    switch (language) {
      case LanguagesENUM.English:
        this.snackService.buildNotification(`Link copied`, null);
        break;
      case LanguagesENUM.Russian:
        this.snackService.buildNotification(`Ссылка скопирована`, null);
        break;
      case LanguagesENUM.Ukraine:
        this.snackService.buildNotification(`Посилання скопійоване`, null);
        break;
      default:
        throw new Error('error');
    }
  };

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
