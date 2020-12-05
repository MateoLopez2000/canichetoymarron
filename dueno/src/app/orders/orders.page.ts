import { Component, OnInit } from '@angular/core';
import { FirestoreService } from "../services/data/firestore.service";

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {

  pedidos: any = [];

  constructor(
    private firestoreService: FirestoreService
  ) {
  }

  ngOnInit() {
    this.getPedidos();
  }
  getPedidos() {
    this.firestoreService.getPedidos().subscribe((pedidosList) => {
      this.pedidos = [];
      pedidosList.forEach((pedido: any) => {
        let pedidoData = pedido.payload.doc.data();
        let idPedido = pedido.payload.doc.id.toUpperCase();
        this.pedidos.push({
          id: idPedido,
          position: {
            lat: pedidoData.position.lat,
            lng: pedidoData.position.lng,
          },
          estado: pedidoData.estado,
          direccion: pedidoData.direccion,
          fechahorapedido: pedidoData.fechahorapedido,
          nit: pedidoData.nit,
          moto: this.getDriverName(pedidoData.moto)[0].toUpperCase(),
          nombre: pedidoData.nombre,
          productos: pedidoData.productos,
          sucursal: pedidoData.sucursal,
          telefono: pedidoData.telefono,
          total: pedidoData.total
        });
      });
    });
  }
  getDriverName(user: string){
    return user.split('@');
  }
}
