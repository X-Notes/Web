import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Folder } from '../models/folder';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { FolderStore } from '../state/folders-state';
import { takeUntil, map } from 'rxjs/operators';
import { SelectIdFolder, UnSelectIdFolder } from '../state/folders-actions';
import { Router } from '@angular/router';
import { FontSize } from 'src/app/shared/enums/FontSize';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss']
})
export class FolderComponent implements OnInit, OnDestroy {

  selectedFlag = false;
  fontSize = FontSize;
  destroy = new Subject<void>();

  isHighlight = false;
  @Input() folder: Folder;

  constructor(private store: Store,
              private router: Router) { }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.store.select(FolderStore.selectedIds)
    .pipe(takeUntil(this.destroy))
    .pipe(map(z => this.tryFind(z)))
    .subscribe(flag => this.isHighlight = flag);

    this.store.select(FolderStore.selectedCount)
    .pipe(takeUntil(this.destroy))
    .subscribe(x => {
      if (x > 0) {
        this.selectedFlag = true;
      } else {
        this.selectedFlag = false;
      }
    });
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

  toFolder() {
    const flag = this.store.selectSnapshot(FolderStore.selectedCount) > 0 ? true : false;
    if (flag) {
      this.highlight(this.folder.id);
    } else {
      this.router.navigate([`folders/${this.folder.id}`]);
    }
  }

  shadeColor(color, percent) {

    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = parseInt( (R * (100 + percent) / 100).toString() , 10);
    G = parseInt( (G * (100 + percent) / 100).toString() , 10);
    B = parseInt( (B * (100 + percent) / 100).toString() , 10);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    const RR = ((R.toString(16).length === 1) ? '0' + R.toString(16) : R.toString(16));
    const GG = ((G.toString(16).length === 1) ? '0' + G.toString(16) : G.toString(16));
    const BB = ((B.toString(16).length === 1) ? '0' + B.toString(16) : B.toString(16));

    return '#' + RR + GG + BB;
}

}
