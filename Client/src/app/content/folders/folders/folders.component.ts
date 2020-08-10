import { Component, OnInit, OnDestroy } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen } from 'src/app/shared/services/personalization.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Folder } from '../models/folder';


@Component({
  selector: 'app-folders',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.scss'],
  animations: [ sideBarCloseOpen ]
})
export class FoldersComponent implements OnInit, OnDestroy {

  destroy = new Subject<void>();

  theme = Theme;

  constructor(public pService: PersonalizationService) { }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  async ngOnInit() {
    this.pService.onResize();
    this.pService.subject
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.newFolder());
  }

  newFolder() {
    console.log('folder');
  }

  cancelSideBar() {
    this.pService.stateSidebar = false;
  }

}
