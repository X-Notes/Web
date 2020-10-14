import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MurriService } from 'src/app/shared/services/murri.service';
import { PaginationService } from 'src/app/shared/services/pagination.service';
import { Label } from './models/label';

@Injectable()
export class LabelsService implements OnDestroy  {

  destroy  = new Subject<void>();
  public allLabels: Label[] = [];
  public labels: Label[] = [];

  constructor(
    private pagService: PaginationService,
    private murriService: MurriService,
    ) {
    this.pagService.nextPagination
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.nextValuesForPagination());
   }

  ngOnDestroy(): void {
    console.log('destroy');
    this.destroy.next();
    this.destroy.complete();
  }

   nextValuesForPagination() {
    const nextFolders = this.allLabels.slice(this.labels.length, this.labels.length + this.pagService.countNextLabels);
    this.addToDomAppend(nextFolders);
  }

  firstInit(labels: Label[]) {
    this.allLabels = [...labels].map(label => { label = {...label}; return label; });
    this.labels = this.allLabels.slice(0, 65);
    this.pagService.newPage();
  }

  addToDomAppend(labels: Label[]) {
    if (labels.length > 0) {
      this.labels = [...labels.map(note => { note = { ...note }; return note; }) , ...this.labels];
      setTimeout(() => {
        const DOMnodes = document.getElementsByClassName('grid-item');
        for (let i = 0; i < labels.length; i++) {
          const el = DOMnodes[i];
          this.murriService.grid.add(el, {index: -1, layout: true});
        }
      }, 0);
    }
  }
}
