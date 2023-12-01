import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { UserStore } from '../core/stateUser/user-state';
import { ThemeENUM } from '../shared/enums/theme.enum';

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
