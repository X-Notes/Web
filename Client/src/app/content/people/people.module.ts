import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeopleComponent } from './people/people.component';
import { PeopleRouting } from './people-routing';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [PeopleComponent],
  imports: [
    CommonModule,
    PeopleRouting,
    SharedModule
  ]
})
export class PeopleModule { }
