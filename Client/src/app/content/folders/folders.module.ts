import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoldersComponent } from './folders/folders.component';
import { FoldersRouting } from './folders-routing';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [FoldersComponent],
  imports: [
    CommonModule,
    FoldersRouting,
    SharedModule
  ]
})
export class FoldersModule { }
