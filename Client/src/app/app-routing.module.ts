import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';
import { ContentComponent } from './content/content/content.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['about']);

const routes: Routes = [
  {
    path: '',
    component: ContentComponent,
    ...canActivate(redirectUnauthorizedToLogin),
    children: [
      {
        path: 'notes',
        loadChildren: () =>
          import('./content/notes/notes.module').then(({ NotesModule }) => NotesModule),
      },
      {
        path: 'folders',
        loadChildren: () =>
          import('./content/folders/folders.module').then(({ FoldersModule }) => FoldersModule),
      },
      {
        path: 'labels',
        loadChildren: () =>
          import('./content/labels/labels.module').then(({ LabelsModule }) => LabelsModule),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./content/profile/profile.module').then(({ ProfileModule }) => ProfileModule),
      },
      {
        path: '',
        redirectTo: '/notes',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'note',
    loadChildren: () =>
      import('./public/public-note/public-note.module').then(
        ({ PublicNoteModule }) => PublicNoteModule,
      ),
  },
  {
    path: 'folder',
    loadChildren: () =>
      import('./public/public-folder/public-folder.module').then(
        ({ PublicFolderModule }) => PublicFolderModule,
      ),
  },
  {
    path: 'about',
    loadChildren: () => import('./about/about.module').then(({ AboutModule }) => AboutModule),
  },
  {
    path: 'faq',
    loadChildren: () => import('./faq/faq.module').then(({ FaqModule }) => FaqModule),
  },
  {
    path: '**',
    loadChildren: () =>
      import('./error-four/error-four.module').then(({ ErrorFourModule }) => ErrorFourModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
