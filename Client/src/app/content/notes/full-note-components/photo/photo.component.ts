import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ThemeENUM } from 'src/app/shared/enums/ThemeEnum';
import { photoInit } from 'src/app/shared/services/personalization.service';
import { Photo } from '../../models/ContentMode';

@Component({
  selector: 'app-photo',
  templateUrl: './photo.component.html',
  styleUrls: ['./photo.component.scss'],
  animations: [photoInit],
})
export class PhotoComponent implements AfterViewInit {
  @Output()
  deleteEvent = new EventEmitter<string>();

  @ViewChild(MatMenu) menu: MatMenu;

  @Input()
  photo: Photo;

  destroy = new Subject<void>();

  constructor(private store: Store) {}

  ngAfterViewInit(): void {
    this.store
      .select(UserStore.getUserTheme)
      .pipe(takeUntil(this.destroy))
      .subscribe((theme) => {
        if (theme) {
          if (theme.name === ThemeENUM.Dark) {
            this.menu.panelClass = 'dark-menu';
          } else {
            this.menu.panelClass = null;
          }
        }
      });
  }

  onLoadImage() {
    this.photo.loaded = true;
  }

  deletePhoto() {
    this.deleteEvent.emit(this.photo.id);
  }
}
