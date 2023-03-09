import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class DestroyComponentService implements OnDestroy {

  d$ = new Subject<void>();
  
  constructor() { }
  
  ngOnDestroy(): void {
    console.log('ngOnDestroy ngOnDestroy ngOnDestroy');
    this.d$.next();
    this.d$.complete();
  }
}
