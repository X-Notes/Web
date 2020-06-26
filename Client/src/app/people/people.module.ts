import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeopleComponent } from './people/people.component';
import { PeopleRouting } from './people-routing';



@NgModule({
  declarations: [PeopleComponent],
  imports: [
    CommonModule, PeopleRouting
  ]
})
export class PeopleModule { }
