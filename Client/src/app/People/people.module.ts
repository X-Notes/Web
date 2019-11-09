import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PeopleComponent} from './people/people.component';


@NgModule({
  declarations: [PeopleComponent],
  imports: [
    CommonModule
  ]
  ,
  exports: [
    PeopleComponent
  ]
})
export class PeopleModule { }
