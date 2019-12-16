import { OnDestroy } from '@angular/core';
import { NootsService } from 'src/app/Services/noots.service';
import { Noot } from 'src/app/Models/Noots/Noot';
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
  selector: 'app-all-noots',
  templateUrl: './all-noots.component.html',
  styleUrls: ['./all-noots.component.sass'],
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
export class AllNootsComponent implements OnInit, OnDestroy {

  noots: Noot[];
  unsubscribe = new Subject();
  constructor(private nootService: NootsService, private router: Router) { }

  update = false;
  items = [{component: 'app-noot'},
  {component: 'app-noot'},
  {component: 'app-noot'},
  {component: 'app-noot'}
  ];
  updateMenu = [];
  Changed(condition: any) {
    for (let num = 0; num < this.items.length; num++) {
      console.log(condition, 1);
      if (condition === false) {
        this.update = true;
        this.updateMenu.push({id: num});
        console.log(this.updateMenu);
        break;
      }
    }
    console.log(condition, 2);
    if (condition === true) {
      this.updateMenu.pop();
      console.log(this.updateMenu);
      if (this.updateMenu.length === 0) {
        this.update = false;
        console.log(condition, 3);
      }
    }
  }
  ngOnInit() {
    setTimeout(() => this.nootService.GetAll().pipe(takeUntil(this.unsubscribe))
    .subscribe(x => this.noots = x
      , error => console.log(error)), 400);

  }
  OpenNoot(id: string) {
    this.router.navigate(['/noots', id]);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.unsubscribe();
  }
}

