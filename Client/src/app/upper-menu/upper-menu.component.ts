import { Component, OnInit, NgModule} from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [BrowserAnimationsModule, BrowserModule]
})

@Component({
  selector: 'app-upper-menu',
  templateUrl: './upper-menu.component.html',
  styleUrls: ['./upper-menu.component.sass'],
  animations: [
    
  ]
})
export class UpperMenuComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
