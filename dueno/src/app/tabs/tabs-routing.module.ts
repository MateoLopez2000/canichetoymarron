import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { pathToFileURL } from 'url';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
<<<<<<< HEAD
      { path: 'map',loadChildren: () =>import('../maps/maps.module').then(map=>map.MapsPageModule)}
=======
      {
        path: 'maps',
        loadChildren: () => import('../maps/maps.module').then(map=>map.MapsPageModule)
      },
      {
        path: 'sucursales',
        loadChildren: () => import('../sucursales/sucursales.module').then(sucursal=>sucursal.SucursalesPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/maps',
        pathMatch: 'full'
      }
>>>>>>> fea5d0d039f1486f4d141298fc3df05e34e628b4
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/map',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}

