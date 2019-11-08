import { Component, OnInit, NgModule } from '@angular/core';
import {animate, transition, trigger, state, style} from '@angular/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
@NgModule({ imports: [BrowserAnimationsModule]})
@Component({
  selector: 'app-view-label',
  templateUrl: './view-label.component.html',
  styleUrls: ['./view-label.component.sass'],
/*animations: [
    trigger('AddAnimate', [
      transition('initial=>final', [
        animate('1s')
      ]),
      transition('final=>initial', [
        animate('1s')
      ]),
  ]),
  ]*/
})
export class ViewLabelComponent implements OnInit {

  constructor() { }
  // currentState = 'initial';
  update = false;
  update1 = false;
  update22() {
    // this.currentState = this.currentState === 'initial' ? 'final' : 'initial';
  }
  ngOnInit() {
  }

}
