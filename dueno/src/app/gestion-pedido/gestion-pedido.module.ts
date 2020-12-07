import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

// import { GestionPedidoPageRoutingModule } from './gestion-pedido-routing.module';
import { GestionPedidoPage } from './gestion-pedido.page';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([{ path: '', component: GestionPedidoPage }])

  ],
  declarations: [GestionPedidoPage]
})
export class GestionPedidoPageModule {}
