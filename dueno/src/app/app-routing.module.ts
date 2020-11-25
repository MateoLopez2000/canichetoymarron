import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  //{ path: 'home', loadChildren: () => import('./home/home.module').then( m => m.HomePageModule) },
  { path: '', loadChildren: () => import('./tabs/tabs.module').then( m => m.TabsPageModule) },
  /*{
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'sucursales',
    loadChildren: () => import('./sucursales/sucursales.module').then( m => m.SucursalesPageModule)
  },
  {
    path: 'maps',
    loadChildren: () => import('./maps/maps.module').then( m => m.MapsPageModule)
  }*/
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

 