import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
<<<<<<< HEAD
  { path: 'home', loadChildren: () => import('./home/home.module').then( m => m.HomePageModule) },
  { path: '', loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule) },
  { path: 'tabs', loadChildren: () => import('./tabs/tabs.module').then( m => m.TabsPageModule) },
  {
=======
  //{ path: 'home', loadChildren: () => import('./home/home.module').then( m => m.HomePageModule) },
  { path: '', loadChildren: () => import('./tabs/tabs.module').then( m => m.TabsPageModule) },
  /*{
>>>>>>> fea5d0d039f1486f4d141298fc3df05e34e628b4
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
<<<<<<< HEAD
    path: 'password-recovery',
    loadChildren: () => import('./password-recovery/password-recovery.module').then( m => m.PasswordRecoveryPageModule)
  },
=======
    path: 'sucursales',
    loadChildren: () => import('./sucursales/sucursales.module').then( m => m.SucursalesPageModule)
  },
  {
    path: 'maps',
    loadChildren: () => import('./maps/maps.module').then( m => m.MapsPageModule)
  }*/
>>>>>>> fea5d0d039f1486f4d141298fc3df05e34e628b4
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

 