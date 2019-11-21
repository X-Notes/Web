import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PeopleComponent} from './people/people.component';
import { UserComponent } from './user/user.component';


@NgModule({
  declarations: [PeopleComponent, UserComponent],
  imports: [
    CommonModule
  ]
  ,
  exports: [
    PeopleComponent
  ]
})
export class PeopleModule { }
