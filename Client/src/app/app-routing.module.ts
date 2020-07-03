import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { ContentLoadGuard } from './core/guards/content-load.guard';
import { ContentActiveteGuard } from './core/guards/content-activete.guard';


const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./content/content.module').then(m => m.ContentModule),
    canActivate: [ContentActiveteGuard]
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
  imports: [RouterModule.forRoot(routes,      {
    preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
