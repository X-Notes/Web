import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoldersComponent } from './folders/folders.component';
import { FoldersRouting } from './folders-routing';



@NgModule({
  declarations: [FoldersComponent],
  imports: [
    CommonModule, FoldersRouting
  ]
})
export class FoldersModule { }
