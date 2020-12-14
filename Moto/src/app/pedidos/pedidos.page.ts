import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireAuth } from '@angular/fire/auth';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

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
    public ngFireAuth: AngularFireAuth,
    private alertController: AlertController,
    private router: Router
    ) { }

  ngOnInit() {
    this._getPedido();
  }

  getUser() {
    this.ngFireAuth.authState.subscribe(res => {
      if (res && res.uid) {
        this.user = res.email;
      } else {
        this.router.navigateByUrl('');
        console.log('user not logged in');
      }
    });
  }
  _getPedido() {
    this.getUser();
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
    this.showLogOutAlert()
    this.database.collection("pedidos").doc(idPedido).update({estado: "Entregado"});
    this.miPedido = null;
  }

  async showLogOutAlert() {
    const alert = await this.alertController.create({
      header: 'Pedido Entregado!',
      message: '¿Desea seguir recibiendo pedidos?',
      buttons:  [
        {
          text: 'Cerrar Sesion',
          handler: () => {
            this.database.collection("Motos").doc(this.user).update({estado: "ocupado"});
            this.router.navigateByUrl('')
          }
        },
        {
          text: 'Continuar Trabajando',
          handler: () => {
            this.database.collection("Motos").doc(this.user).update({estado: "disponible"});
            this.router.navigateByUrl('/tabs/map');
          }
        }
      ]
    });
    await alert.present();
  }
}
