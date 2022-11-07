import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditComponent } from './pages/edit/edit.component';
import { ListComponent } from './pages/list/list.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/list',
  },
  {
    path: 'list',
    component: ListComponent,
  },
  {
    path: 'add',
    component: EditComponent,
    data: {
      mode: 'add',
    },
  },
  {
    path: 'edit',
    component: EditComponent,
    data: {
      mode: 'edit',
    },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
