import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicFolderComponent } from './public-folder.component';
import { PublicFolderRouting } from './public-folder.routing';
import { FoldersModule } from '../../content/folders/folders.module';
import { SharedModule } from '../../shared/shared.module';
import { PublicFolderContentComponent } from './components/public-folder-content/public-folder-content.component';
import { SharedPublicModule } from '../shared-public/shared-public/shared-public.module';

@NgModule({
  declarations: [PublicFolderComponent, PublicFolderContentComponent],
  imports: [CommonModule, PublicFolderRouting, FoldersModule, SharedModule, SharedPublicModule],
})
export class PublicFolderModule {}
