import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Folder } from '../models/folder';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { FolderStore } from '../state/folders-state';
import { takeUntil, map } from 'rxjs/operators';
import { SelectIdFolder, UnSelectIdFolder } from '../state/folders-actions';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss']
})
export class FolderComponent implements OnInit, OnDestroy {

  destroy = new Subject<void>();

  isHighlight = false;
  @Input() folder: Folder;

  constructor(private store: Store) { }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.store.select(FolderStore.selectedIds)
    .pipe(takeUntil(this.destroy))
    .pipe(map(z => this.tryFind(z)))
    .subscribe(flag => this.isHighlight = flag);
  }

  tryFind(z: string[]): boolean {
    const exist = z.find(id => id === this.folder.id);
    return exist !== undefined ? true : false;
  }

  highlight(id: string) {
    if (!this.isHighlight) {
      this.store.dispatch(new SelectIdFolder(id));
    } else {
      this.store.dispatch(new UnSelectIdFolder(id));
    }
  }

}
