import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule) },
  { path: 'tabs', loadChildren: () => import('./tabs/tabs.module').then( m => m.TabsPageModule) },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'password-recovery',
    loadChildren: () => import('./password-recovery/password-recovery.module').then( m => m.PasswordRecoveryPageModule)
  },
  /*{
    path: 'register',
    loadChildren: () => import('./register/register.module').then( m => m.RegisterPageModule)
  },*/
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

 