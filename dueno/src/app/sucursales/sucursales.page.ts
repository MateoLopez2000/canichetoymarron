import {Component,OnInit,NgZone,ElementRef,ViewChild,} from "@angular/core";
import { Geolocation, Geoposition } from "@ionic-native/geolocation/ngx";
import {IonSlides,NavController,ToastController,LoadingController,} from "@ionic/angular";
import {GoogleMaps,Marker,MarkerCluster,MarkerOptions,} from "@ionic-native/google-maps";
import {AngularFirestoreDocument,AngularFirestore,} from "@angular/fire/firestore";
import { Observable } from "rxjs";
import * as firebase from "firebase";
import {NativeGeocoder,NativeGeocoderResult, NativeGeocoderOptions,} from "@ionic-native/native-geocoder/ngx";
import { FirestoreService } from "../services/data/firestore.service";
import { tick } from "@angular/core/testing";
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
  long: string;
  location: any;
  markerObj: any;
  markers: MarkerOptions[] = [];
  motos: MarkerOptions[] = [];
  infoWindows: any = [];

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
  ) {}

  ngOnInit() {
    this.loadMap();
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
      icon : "../assets/icon/tienda.png"
    });
    return marker;
  }
  addMakerMotos(itemMarker: MarkerOptions) {
    const marker = new google.maps.Marker({
      position : { lat: itemMarker.position.lat, lng: itemMarker.position.lng },
      map : this.map,
      title : itemMarker.nombreDeMoto,
      icon : "../assets/icon/repartidor.png"
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
          name : sucursal.name,
          address : sucursal.address,
          telephone : sucursal.telephone,
          attention : sucursal.attention,
          imageURL : sucursal.imageURL
        });
      });
    });
  }

  getMotos() {
    this.firestoreService.getData("Motos").subscribe((motosArray) => {
      this.motos = [];
      motosArray.forEach((moto: any) => {
        this.motos.push({
          position: {
            lat: Number(moto.position.lat),
            lng: Number(moto.position.lng),
          },
          nombreDeMoto: moto.nombreDeMoto
        });
      });
    });
  }
  updateTracking() {
    this.firestoreService.trackingUpdate("true");
    this.firestoreService.trackingUpdate("false");
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
