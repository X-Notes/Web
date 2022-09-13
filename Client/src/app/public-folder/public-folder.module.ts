import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicFolderComponent } from './public-folder.component';
import { PublicFolderRouting } from './public-folder.routing';
import { FoldersModule } from '../content/folders/folders.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [PublicFolderComponent],
  imports: [CommonModule, PublicFolderRouting, FoldersModule, SharedModule],
})
export class PublicFolderModule {}
