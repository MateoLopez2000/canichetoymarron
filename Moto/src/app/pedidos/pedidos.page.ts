import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireAuth } from '@angular/fire/auth';
//import { MapsPage } from '../maps/maps.page';
@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
})
export class PedidosPage implements OnInit {

  miPedido: any;
  user: any;

  constructor(
    private database: AngularFirestore, 
   //private mapsPage: MapsPage,
    public ngFireAuth: AngularFireAuth
    ) { }

  ngOnInit() {
    this._getPedido()
  }

  _getPedido() {
    this.user = this.ngFireAuth.authState._subscribe;
    this.ngFireAuth.authState.subscribe(res => {
      this.user = res.email;
    });
    this.database.collection("pedidos").valueChanges({ idField: 'pedidoId' })
      .subscribe((pedidos: any) => {
        pedidos.forEach(pedido => {
          if (pedido.estado == "En camino" && pedido.moto == this.user) {
            this.miPedido = pedido;
          }
        });
      })
  }
  entregado(idPedido) {
    this.database.collection("pedidos").doc(idPedido).update({estado: "Entregado"});
    this.miPedido = null;
    this.database.collection("Motos").doc(this.user).update({estado: "disponible"});
    //this.mapsPage.showClientLocation(idPedido);
  }

}
