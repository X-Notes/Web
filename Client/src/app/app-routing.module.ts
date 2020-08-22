import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { ContentActiveteGuard } from './core/guards/content-activete.guard';
import { ContentComponent } from './content/content/content.component';


const routes: Routes = [
  {
    path: '',
    component: ContentComponent,
    children: [
      {
          path: 'notes',
          loadChildren: () => import('./content/notes/notes.module').then(m => m.NotesModule)
      },
      {
          path: 'folders',
          loadChildren: () => import('./content/folders/folders.module').then(m => m.FoldersModule)
      },
      {
          path: 'labels',
          loadChildren: () => import('./content/labels/labels.module').then(m => m.LabelsModule)
      },
      {
          path: 'profile',
          loadChildren: () => import('./content/profile/profile.module').then(m => m.ProfileModule)
      },
      {
        path: '',
        redirectTo: '/notes',
        pathMatch: 'full'
      },
  ],
  },
  {
    path: 'about',
    loadChildren: () => import('./about/about.module').then(m => m.AboutModule),
  },
  {
    path: '**',
    loadChildren: () => import('./error-four/error-four.module').then(m => m.ErrorFourModule)
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
