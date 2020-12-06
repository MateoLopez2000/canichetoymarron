import {Component,OnInit,NgZone,ElementRef,ViewChild} from "@angular/core";
import { Geolocation, Geoposition } from "@ionic-native/geolocation/ngx";
import { IonSlides,NavController, AlertController } from "@ionic/angular";
import { GoogleMaps, MarkerOptions } from "@ionic-native/google-maps";
import {AngularFirestoreDocument,AngularFirestore,} from "@angular/fire/firestore";
import * as firebase from "firebase";
import {NativeGeocoder,NativeGeocoderResult, NativeGeocoderOptions,} from "@ionic-native/native-geocoder/ngx";
import { AuthService } from "../services/auth.service";
import { AngularFireAuth } from '@angular/fire/auth';

declare var google;

@Component({
  selector: "app-maps",
  templateUrl: "./maps.page.html",
  styleUrls: ["./maps.page.scss"],
})
export class MapsPage implements OnInit {
  @ViewChild(IonSlides) slides: IonSlides;
  map: any;
  lat: string;
  currentlat: string;
  currentlong: string;
  long: string;
  location: any;
  user: any;
  infoWindow: any;
  markers: MarkerOptions[] = [];
  infoWindows: any = [];

  constructor(
    private geolocation: Geolocation,
    private zone: NgZone,
    public navCtrl: NavController,
    private googleMaps: GoogleMaps,
    private database: AngularFirestore,
    private nativeGeocoder: NativeGeocoder,
    public auth: AuthService,
    public ngFireAuth: AngularFireAuth,
    private firestoreService: AuthService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadMap();
    this.checkTrackingUpdate();
    this.listenNewOrder();
  }

  loadMap() {
    this.geolocation
      .getCurrentPosition()
      .then((resp) => {
        let latLng = new google.maps.LatLng(
          resp.coords.latitude,
          resp.coords.longitude
        );


        let mapOptions = {
          center: latLng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
        };

        this.map = new google.maps.Map(
          document.getElementById("map"),
          mapOptions
        );

        this.map.addListener("tilesloaded", () => {
          this.lat = this.map.center.lat();
          this.long = this.map.center.lng();
          this.loadMarkers();
          this.addMarker(latLng);
        });
      })
      .catch((error) => {
        console.log("Error getting location", error);
      });
  }

  checkTrackingUpdate() {
    this.user = this.ngFireAuth.authState._subscribe;
    this.ngFireAuth.authState.subscribe(res => {
      this.user = res.email;
    });
    this.database.collection("tracking").doc("update").valueChanges()
    .subscribe((val: any) => {if (val.actualizarBool=="true") {
      this.geolocation.getCurrentPosition().then((geposition: Geoposition) => {
        let lat = geposition.coords.latitude.toString();
        let long = geposition.coords.longitude.toString();
        //console.log(lat,long);
        //this.addMarker(geposition)
        this.auth
          .update_location(this.user, lat, long)
          .then((auth) => {
            console.log(auth);
          })
          .catch((err) => console.log(err));
      });
    }});
  }
  addMarker(location) {
    const marker = new google.maps.Marker({
      position: location,
      map: this.map,
      title: "You are here",
      icon : "../assets/icon/repartidor.png"
    });
    this.markers.push(marker);
  }
  //Add markers of sucursales 
  addSucursalMaker(itemMarker: MarkerOptions) {
    const marker = new google.maps.Marker({
      position: { lat: itemMarker.position.lat, lng: itemMarker.position.lng },
      map: this.map,
      title: itemMarker.name,
      text: itemMarker.address,
      img: itemMarker.image,
      icon : "../assets/icon/tienda.png"
    });
    return marker;
  }
  loadMarkers() {
    this.getSucursales();
    this.markers.forEach((marker) => {
      const markerObj = this.addSucursalMaker(marker);
      marker.markerObj = markerObj;
      this.addInfoWindowToMarker(markerObj);
    });
  }
  //Add slide cards 
  async onSlideDidChange() {
    const currentSlide = await this.slides.getActiveIndex();
    const marker = this.markers[currentSlide];
    this.map.panTo({ lat: marker.position.lat, lng: marker.position.lng });
  }
  //Get locations of sucursales
  getSucursales() {
    this.firestoreService.getSucursalesData("sucursales").subscribe((sucursalesArray) => {
      this.markers = [];
      sucursalesArray.forEach((sucursal: any) => {
        this.markers.push({
          position: {
            lat: sucursal.position.lat,
            lng: sucursal.position.lng,
          },
          name : sucursal.name,
          address : sucursal.address,
          telephone : sucursal.telephone,
          attention : sucursal.attention,
          imageURL : sucursal.imageURL
        });
      });
    });
  }
  //Add info windows
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
  
  listenNewOrder() {
    this.database.collection("pedidos").valueChanges({ idField: 'pedidoId' })
    .subscribe((pedidos: any) => {
      pedidos.forEach(pedido => {
        if(pedido.moto == this.user && pedido.estado == "Listo para recoger") {
          this.showAlert(pedido.pedidoId, pedido.direccion);
        }      
      });
    })
  }

  async showAlert(idPedido, direccionPedido) {
    const alert = await this.alertController.create({
      header: 'Nuevo pedido!',
      subHeader: 'Direccion de entrega: '+direccionPedido,
      message: '¿Desea aceptar el pedido?',
      buttons:  [
        {
          text: 'Rechazar',
          handler: () => {
            this.database.collection("pedidos").doc(idPedido).update({estado: "Pendiente"});
          }
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.database.collection("pedidos").doc(idPedido).update({estado: "En camino"});
            this.database.collection("Motos").doc(this.user).update({estado: "ocupado"});
          }
        }
      ]
    });

    await alert.present();
  }
}
