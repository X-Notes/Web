import { OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Component, OnInit, NgModule } from '@angular/core';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [BrowserAnimationsModule, BrowserModule]
})

@Component({
  selector: 'app-all-notes',
  templateUrl: './all-notes.component.html',
  styleUrls: ['./all-notes.component.sass'],
  animations: [
    trigger('slideInOut', [
      state('out', style({ height: '*' , overflow: 'hidden'})),
      transition('* => void', [
        style({ height: '*', overflow: 'hidden'}),
        animate('300ms ease-in', style({ height: '0', opacity: '0.3'}))
      ]),
      state('in', style({ height: '0' })),
      transition('void => *', [
        style({ height: '0', overflow: 'hidden'}),
        animate('300ms ease-out', style({ height: '*' , overflow: 'hidden'}))
      ])
    ])
  ]
})
export class AllNotesComponent implements OnInit, OnDestroy {


  unsubscribe = new Subject();
  constructor(private router: Router) { }

  update = false;
  updateMenu: string[] = [];

  RemoveChanged(id: string) {
    this.updateMenu = this.updateMenu.filter(x => x !== id);
    if (this.updateMenu.length > 0) {
      this.update = true;
    } else {
      this.update = false;
    }
  }
  AddChanged(id: string) {
    this.updateMenu.push(id);
    this.update = true;
  }

  ngOnInit() {
  }

  OpenNoot(id: string) {
    this.router.navigate(['/notes', id]);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.unsubscribe();
  }
}

