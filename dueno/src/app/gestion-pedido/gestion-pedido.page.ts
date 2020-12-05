import { Component, OnInit, NgZone, ElementRef, ViewChild } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { NavController } from '@ionic/angular';
import { GoogleMaps, MarkerOptions, Marker } from '@ionic-native/google-maps';
import { FirestoreService } from "../services/data/firestore.service";
import { NumberValueAccessor } from '@angular/forms';

declare var google;

@Component({
  selector: 'app-gestion-pedido',
  templateUrl: './gestion-pedido.page.html',
  styleUrls: ['./gestion-pedido.page.scss'],
})

export class GestionPedidoPage implements OnInit {
  lat: Number;
  lng: Number;
  motos: MarkerOptions[] = [];
  maps: any;
  pedidos:  MarkerOptions[] = [];

  constructor(
    private geolocation: Geolocation,
    public zone: NgZone,
    public navCtrl: NavController,
    private firestoreService: FirestoreService,
  ) {
   }  
  
  ngOnInit() {
    this.getMotos();
    this.getPedidos();
    this.loadMaps();    
  }

  loadMaps() {
    this.geolocation.getCurrentPosition().then((res) => {
      
      this.maps = document.getElementsByClassName("maps");
     
      for (var i=0; i<this.maps.length; i++) {
        let moto = this.motos[i];   
        this.lat = moto.position.lat;
        this.lng = moto.position.lng;

        let latLng = new google.maps.LatLng(this.lat,this.lng);
      
        let mapOptions = {
          center: latLng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
        }

        let map = new google.maps.Map(this.maps[i], mapOptions)

        map.addListener('tilesloaded', () => {
          this.lat = map.center.lat()
          this.lng = map.center.lng()

          const markerObj = this.addMaker(moto, map,  "../assets/icon/repartidor.png");
          moto.markerObj = markerObj;    

          this.obtener_pedido_por_moto(moto.id,map);
         

        }); 
      }
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }
  
   getMotos() {
     this.firestoreService.getMotos().subscribe((motosArray) => {
      this.motos = [];
      motosArray.forEach((moto: any) => {
        let motoData = moto.payload.doc.data();
        this.motos.push({
          id: moto.payload.doc.id,
          position: {
            lat: Number(motoData.position.lat),
            lng: Number(motoData.position.lng),
          },
          nombreDeMoto: motoData.nombreDeMoto,
          estado: motoData.estado
        });
      });
    });
  }

   addMaker (itemMarker: MarkerOptions, newMap: any, path: String) {
    const marker =  new google.maps.Marker({
      position: { lat: itemMarker.position.lat, lng: itemMarker.position.lng },
      map: newMap,
      title: itemMarker.nombreMoto,
      icon: path
    });
    return marker;
  }

  getPedidos() {
    this.firestoreService.getPedidos().subscribe((pedidosList) => {
      this.pedidos = [];
      pedidosList.forEach((pedido: any) => {
        let pedidoData = pedido.payload.doc.data();
        this.pedidos.push({
          id: pedido.payload.doc.id,
          position: {
            lat: Number(pedidoData.position.lat),
            lng: Number(pedidoData.position.lng),
          },
          estado: pedidoData.estado,
          direccion: pedidoData.direccion,
          moto: pedidoData.moto,
          nombre: pedidoData.nombre,
          productos: pedidoData.productos,
          sucursal: pedidoData.sucursal,
          total: pedidoData.total
        });
      });
    });
  }

  obtener_pedido_por_moto(id: any, map){
    this.pedidos.forEach((pedido) => {
      if(pedido.moto  == id){
        const p_markerObj = this.addMaker(pedido, map, "../assets/icon/home.png");
        pedido.p_markerObj = p_markerObj; 
      }
    });
  }
}
  

