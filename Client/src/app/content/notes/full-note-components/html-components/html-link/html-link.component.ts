import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { LanguagesENUM } from 'src/app/shared/enums/LanguagesENUM';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { ApiBrowserTextService } from '../../../api-browser-text.service';
import { ApiServiceNotes } from '../../../api-notes.service';

@Component({
  selector: 'app-html-link',
  templateUrl: './html-link.component.html',
  styleUrls: ['./html-link.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HtmlLinkComponent implements OnInit {
  @Input() link: string;

  data = {
    title: null,
    image: null,
  };

  constructor(
    private api: ApiServiceNotes,
    private apiBrowserService: ApiBrowserTextService,
    private snackService: SnackbarService,
    private store: Store,
  ) {}

  async ngOnInit(): Promise<void> {
    const obj = await this.api.getMetaLink(this.link).toPromise();
    const parser = new DOMParser();
    const parsedHtml = parser.parseFromString(obj.content, 'text/html');
    const allMetas = parsedHtml.querySelectorAll('meta');
    allMetas.forEach((x) => {
      if (x.getAttribute('name') === 'title') {
        this.data.title = x.getAttribute('content');
      }
      if (x.getAttribute('property') === 'og:image') {
        this.data.image = x.getAttribute('content');
      }
    });
    this.data.title = this.data.title || parsedHtml.title;
  }

  openNewTab() {
    window.open(this.link, '_blank');
  }

  copyToBuffer = () => {
    const language = this.store.selectSnapshot(UserStore.getUserLanguage);
    this.apiBrowserService.copyTest(this.link);
    switch (language.name) {
      case LanguagesENUM.english:
        this.snackService.openSnackBar(`Link copied`, null, 'center');
        break;
      case LanguagesENUM.russian:
        this.snackService.openSnackBar(`Ссылка скопирована`, null, 'center');
        break;
      case LanguagesENUM.ukraine:
        this.snackService.openSnackBar(`Посилання скопійоване`, 'center');
        break;
      default:
        throw new Error('error');
    }
  };
}
