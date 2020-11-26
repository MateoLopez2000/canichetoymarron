import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { pathToFileURL } from 'url';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
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
        redirectTo: '/tabs/sucursales',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/sucursales',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}

