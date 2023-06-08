import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { ApiBrowserTextService } from 'src/app/content/notes/api-browser-text.service';
import { SnackbarService } from 'src/app/shared/services/snackbar/snackbar.service';

@Component({
  selector: 'app-html-link',
  templateUrl: './html-link.component.html',
  styleUrls: ['../../../styles/inner-card.scss', './html-link.component.scss'],
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
    private apiBrowserService: ApiBrowserTextService,
    private snackbarService: SnackbarService,
    private translate: TranslateService,
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
    this.apiBrowserService.copyTextAsync(this.link);
    this.snackbarService.openSnackBar(this.translate.instant('snackBar.copied'));
  };

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
