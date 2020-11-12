import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { MurriService } from 'src/app/shared/services/murri.service';
import { Label } from './models/label';

@Injectable()
export class LabelsService implements OnDestroy  {

  destroy  = new Subject<void>();
  public allLabels: Label[] = [];
  public labels: Label[] = [];

  constructor(
    private murriService: MurriService,
    ) {
   }


  ngOnDestroy(): void {
    console.log('destroy');
    this.destroy.next();
    this.destroy.complete();
  }


  firstInit(labels: Label[]) {
    this.allLabels = [...labels].map(label => { label = {...label}; return label; });
    this.labels = this.allLabels;
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
