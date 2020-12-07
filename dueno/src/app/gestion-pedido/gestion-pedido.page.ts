import { NumberValueAccessor } from '@angular/forms';
import { Component, OnInit, NgZone } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { NavController } from '@ionic/angular';
import { GoogleMaps, MarkerOptions, Marker, LatLng } from '@ionic-native/google-maps';
import { FirestoreService } from "../services/data/firestore.service";

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
  directionsRenderers = [];
  directionsServices = [];

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
     
      for (var i = 0; i < this.maps.length; i++) {      
        this.directionsServices[i] =  new google.maps.DirectionsService();
        this.directionsRenderers[i] =  new google.maps.DirectionsRenderer();

        let moto = this.motos[i];   
        let index = i;
        this.lat = moto.position.lat;
        this.lng = moto.position.lng;
      
        let mapOptions = {
          center: moto.LatLngMoto,
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
        }

        let map = new google.maps.Map(this.maps[i], mapOptions)  
        this.directionsRenderers[i].setMap(map);
    
        map.addListener('tilesloaded', () => {
          this.lat = map.center.lat()
          this.lng = map.center.lng()

          const markerObj = this.addMaker(moto, map,  "../assets/icon/repartidor.png");
          moto.markerObj = markerObj;    

          this.obtener_pedido_por_moto(map, index);
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
          LatLngMoto: new google.maps.LatLng(motoData.position.lat, motoData.position.lng), 
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
          LatLngPedido: new google.maps.LatLng(pedidoData.position.lat, pedidoData.position.lng), 
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

  obtener_pedido_por_moto( map: any,  index: any){
    this.pedidos.forEach((pedido) => {
      if(pedido.moto  == this.motos[index].id){
        const p_markerObj = this.addMaker(pedido, map, "../assets/icon/home1.png");
        pedido.p_markerObj = p_markerObj;
        (document.getElementsByClassName("idPedido")[index] as HTMLElement).innerHTML = " \t " + pedido.id ;

        this.getRoute(this.motos[index].LatLngMoto, pedido.LatLngPedido, index);
      }
    });
  }

  private getRoute(start: String, end: String, index: any) {
      this.directionsServices[index].route({
        origin: start,
        destination: end,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
      }, (response, status) => {
        if (status === "OK") {
          this.directionsRenderers[index].setDirections(response);
          this.computeTotalDistance(this.directionsRenderers[index].getDirections(), index);
        } else {
         console.log("Direction Error : " + status );
        }
      });  

  }

  computeTotalDistance(result, index ) {
    let total = 0;
    let time = 0;
    const myroute = result.routes[0];
    
    for (let i = 0; i < myroute.legs.length; i++) {
      total += myroute.legs[i].distance.value;
      time += myroute.legs[i].duration.value;
    }
    
    time = parseInt((time / 60).toString());
    total = total / 1000;
    (document.getElementsByClassName("total")[index] as HTMLElement).innerHTML = "A " +  total + " km. de Distancia del Pedido.  ( " + time + " min )";
    
  }
}
  

