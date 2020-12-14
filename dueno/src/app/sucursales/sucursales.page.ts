import { Component, OnInit, NgZone, ViewChild, } from "@angular/core";
import { Geolocation} from "@ionic-native/geolocation/ngx";
import { IonSlides, NavController, ToastController, LoadingController, } from "@ionic/angular";
import { GoogleMaps, MarkerOptions, } from "@ionic-native/google-maps";
import {  AngularFirestore, } from "@angular/fire/firestore";
import { NativeGeocoder} from "@ionic-native/native-geocoder/ngx";
import { FirestoreService } from "../services/data/firestore.service";
declare var google;
//let uid = 'SUCURSAL TEST';

@Component({
  selector: "app-sucursales",
  templateUrl: "./sucursales.page.html",
  styleUrls: ["./sucursales.page.scss"],
})
export class SucursalesPage implements OnInit {
  @ViewChild(IonSlides) slides: IonSlides;

  map: any;
  infoWindow: any;
  lat: string;
  idpruebapedido: string;
  long: string;
  location: any;
  markerObj: any;
  markers: MarkerOptions[] = [];
  motos: MarkerOptions[] = [];
  infoWindows: any = [];
  pedidos: any = [];

  constructor(
    private geolocation: Geolocation,
    public zone: NgZone,
    public navCtrl: NavController,
    private googleMaps: GoogleMaps,
    private database: AngularFirestore,
    private nativeGeocoder: NativeGeocoder,
    private firestoreService: FirestoreService,
    public toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.loadMap();
    this.getLocations();
    this.getMotos();
    this.getPedidos();
  }
  insertPedidoPrueba(){
    this.firestoreService.insertPedido(this.idpruebapedido);
    this.idpruebapedido ="";
  }
  loadMap() {
    this.geolocation
      .getCurrentPosition()
      .then((resp) => {
        let latLng = new google.maps.LatLng(
          resp.coords.latitude,
          resp.coords.longitude
        );
        this.lat = resp.coords.latitude.toString();
        this.long = resp.coords.longitude.toString();
        let mapOptions = {
          center: latLng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
        };

        this.map = new google.maps.Map(
          document.getElementById("map1"),
          mapOptions
        );
        this.map.addListener("tilesloaded", () => {
          this.lat = this.map.center.lat();
          this.long = this.map.center.lng();

          this.loadMarkers();
        });
      })
      .catch((error) => {
        console.log("Error getting location", error);
      });
  }

  addMaker(itemMarker: MarkerOptions) {
    const marker = new google.maps.Marker({
      position: { lat: itemMarker.position.lat, lng: itemMarker.position.lng },
      map: this.map,
      title: itemMarker.name,
      text: itemMarker.address,
      img: itemMarker.image,
      icon: "../assets/icon/tienda.png"
    });
    return marker;
  }
  addMakerMotos(itemMarker: MarkerOptions) {
    const marker = new google.maps.Marker({
      position: { lat: itemMarker.position.lat, lng: itemMarker.position.lng },
      map: this.map,
      title: itemMarker.nombreDeMoto,
      icon: "../assets/icon/repartidor.png"
    });
    return marker;
  }
  loadMarkers() {
    this.getLocations();
    this.markers.forEach((marker) => {
      const markerObj = this.addMaker(marker);
      marker.markerObj = markerObj;
      this.addInfoWindowToMarker(markerObj);
    });

    this.getMotos();
    this.motos.forEach((marker) => {
      const markerObj = this.addMakerMotos(marker);
      marker.markerObj = markerObj;
    });
  }
  async onSlideDidChange() {
    const currentSlide = await this.slides.getActiveIndex();
    const marker = this.markers[currentSlide];
    this.map.panTo({ lat: marker.position.lat, lng: marker.position.lng });
  }

  getLocations() {
    this.firestoreService.getData("sucursales").subscribe((sucursalesArray) => {
      this.markers = [];
      sucursalesArray.forEach((sucursal: any) => {
        this.markers.push({
          position: {
            lat: sucursal.position.lat,
            lng: sucursal.position.lng,
          },
          name: sucursal.name,
          address: sucursal.address,
          telephone: sucursal.telephone,
          attention: sucursal.attention,
          imageURL: sucursal.imageURL
        });
      });
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
      this.getPedidos();
    });
  }
  doRefresh(event) {
    this.loadMap();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
  getPedidos() {
    this.firestoreService.getPedidos().subscribe((pedidosList) => {
      this.pedidos = [];
      pedidosList.forEach((pedido: any) => {
        let pedidoData = pedido.payload.doc.data();
        let idPedido = pedido.payload.doc.id;
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
          moto: pedidoData.moto,
          nombre: pedidoData.nombre,
          productos: pedidoData.productos,
          sucursal: pedidoData.sucursal,
          telefono: pedidoData.telefono,
          total: pedidoData.total
        });
        if (this.orderNeedMoto(pedidoData)) {
          this.assignMoto(pedido);
        }
      });
    });
  }
  orderNeedMoto(pedido){
    return pedido.estado === "Listo para recoger" && pedido.moto === ""
  }
  assignMoto(pedido) {
    let idPedido = pedido.payload.doc.id;
    let pedidoData = pedido.payload.doc.data();
    let { latSucursal, lngSucursal } = this.getPositionSucursal(pedidoData.sucursal);
    let motoasignada = this.calculateNearestMoto(latSucursal, lngSucursal);
    if(this.noMotoAvailable(motoasignada)){
      return
    }
    this.updateMotoStateLocally(motoasignada);
    this.firestoreService.updateData("pedidos", idPedido, { "moto": motoasignada });
    this.firestoreService.updateData("Motos", motoasignada, { "estado": "ocupado" });
  }
  private updateMotoStateLocally(motoasignada: any) {
    this.motos.forEach(moto => {
      if (moto.id === motoasignada) {
        moto.estado = "ocupado";
      }
    });
  }
  private noMotoAvailable(motoasignada: any) {
    return motoasignada === "";
  }
  private getPositionSucursal(idsucursal) {
    let latSucursal;
    let lngSucursal;
    this.markers.forEach(sucursal => {
      if (idsucursal === sucursal.name) {
        latSucursal = sucursal.position.lat;
        lngSucursal = sucursal.position.lng;
      }
    });
    return { latSucursal, lngSucursal };
  }
  private calculateNearestMoto(latSucursal: any, lngSucursal: any) {
    var min = Number.MAX_VALUE;
    let motoasignada;
    var foundmoto = false;
    this.motos.forEach(moto => {
      if (moto.estado === "disponible") {
        let distance = this.calculateDistance(moto.position.lat, latSucursal, moto.position.lng, lngSucursal);
        if (distance < min) {
          min = distance;
          motoasignada = moto.id;
          foundmoto = true;
        }
      }
    });
    if(!foundmoto){
      return ""
    }
    return motoasignada;
  }
  private calculateDistance(lat1, lat2, lng1, lng2) {
    let distance;
    distance = Math.abs(Math.abs(Number(lat1)) - Math.abs(Number(lat2))) + Math.abs(Math.abs(Number(lng1)) - Math.abs(Number(lng2)));
    return distance;
  }
  addInfoWindowToMarker(marker) {
    let infoWindowContent = "<b>" + marker.title + "</b><br/>" + marker.text;

    let infoWindow = new google.maps.InfoWindow({
      content: infoWindowContent,
    });

    marker.addListener("click", () => {
      this.closeAllInfoWindows();
      infoWindow.open(this.map, marker);
    });
    this.infoWindows.push(infoWindow);
  }

  closeAllInfoWindows() {
    for (let window of this.infoWindows) {
      window.close();
    }
  }
}
