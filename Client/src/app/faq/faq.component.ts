import { Component, HostListener, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { Store } from '@ngxs/store';
import { UserStore } from '../core/stateUser/user-state';
import { ThemeENUM } from '../shared/enums/theme.enum';
import { ContactUsComponent } from '../shared/modal_components/contact-us/contact-us.component';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent implements OnInit {
  items = [
    {
      id: 1,
      title: 'Who we are?',
      description: 'Get started Get started Get started Get started Get started',
    },
    {
      id: 2,
      title: 'No more',
      description: 'Get started Get started Get started Get started Get started',
    },
  ];

  matchedIds = [];

  search = '';

  logoName = 'logo';

  constructor(private readonly store: Store, private readonly dialog: MatDialog) {}

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.logoName = window.innerWidth > 1024 ? 'logo' : 'logo_small';
  }

  ngOnInit(): void {
    this.onResize();
  }

  contactUs() {
    const theme = this.store.selectSnapshot(UserStore.getUserTheme);
    const config: MatDialogConfig = {
      maxHeight: '90vh',
      maxWidth: '90vw',
      autoFocus: false,
      panelClass:
        theme === ThemeENUM.Light ? 'custom-dialog-class-light' : 'custom-dialog-class-dark',
    };
    this.dialog.open(ContactUsComponent, config);
  }

  match() {
    for (const item of this.items) {
      if (item.title.includes(this.search)) {
        this.matchedIds.push(item.id);
      }
    }
  }

  clearSearch() {
    if (this.search === '') {
      this.matchedIds = [];
    }
  }
}
