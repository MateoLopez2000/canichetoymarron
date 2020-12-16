import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireAuth } from '@angular/fire/auth';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from "../services/auth.service";

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
})
export class PedidosPage implements OnInit {

  miPedido: any;
  user: any;
  sucursal: any;
  sucursales: any = [];

  constructor(
    private database: AngularFirestore, 
    public ngFireAuth: AngularFireAuth,
    private alertController: AlertController,
    public auth: AuthService,
    private router: Router
    ) { }

  ngOnInit() {
    this.getSucursales();
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
  getSucursales() {
    this.auth.getSucursales().subscribe((sucursalesArray) => {
      this.sucursales = [];
      sucursalesArray.forEach((sucursal: any) => {
        let sucursalData = sucursal.payload.doc.data();
        let sucursalID = sucursal.payload.doc.id;
        this.sucursales.push({
          id: sucursalID,
          position: {
            lat: Number(sucursalData.position.lat),
            lng: Number(sucursalData.position.lng),
          },
          name: sucursalData.name,
          address: sucursalData.address,
          telephone: sucursalData.telephone,
          attention: sucursalData.attention,
          imageURL: sucursalData.imageURL
        });
      });
    });
  }
  _getPedido() {
    this.getUser();
    this.database.collection("Pedidos").valueChanges({ idField: 'pedidoId' })
      .subscribe((pedidos: any) => {
        pedidos.forEach(pedido => {
          if (pedido.estado == "En camino" && pedido.moto == this.user) {
            this.miPedido = pedido;
            this.getSucursalName(pedido.sucursal);
          }
        });
      });
  }
  getSucursalName(sucursalID){
    this.sucursales.forEach(sucursal => {
      if(sucursal.id===sucursalID){
        this.sucursal=sucursal.name
      }
    });
  }
  entregado(idPedido) {
    this.showLogOutAlert()
    this.database.collection("Pedidos").doc(idPedido).update({estado: "Entregado"});
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
