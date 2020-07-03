import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import { ContentComponent } from './content/content.component';


const routes: Routes = [
    {
        path: '',
        redirectTo: 'notes',
        pathMatch: 'full',
    },
    {
        path: 'notes', component: ContentComponent,
        loadChildren: () => import('./notes/notes.module').then(m => m.NotesModule),
    },
    {
        path: 'folders', component: ContentComponent,
        loadChildren: () => import('./folders/folders.module').then(m => m.FoldersModule),
    },
    {
        path: 'people', component: ContentComponent,
        loadChildren: () => import('./people/people.module').then(m => m.PeopleModule),
    },
    {
        path: 'labels', component: ContentComponent,
        loadChildren: () => import('./labels/labels.module').then(m => m.LabelsModule),
    },
    {
        path: 'profile', component: ContentComponent,
        loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule),
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContentRouting {
}

