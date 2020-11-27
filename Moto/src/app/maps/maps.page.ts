import {Component,OnInit,NgZone,ElementRef,ViewChild} from "@angular/core";
import { Geolocation, Geoposition } from "@ionic-native/geolocation/ngx";
import { IonSlides,NavController } from "@ionic/angular";
import { GoogleMaps, MarkerOptions } from "@ionic-native/google-maps";
import {AngularFirestoreDocument,AngularFirestore,} from "@angular/fire/firestore";
import * as firebase from "firebase";
import {NativeGeocoder,NativeGeocoderResult, NativeGeocoderOptions,} from "@ionic-native/native-geocoder/ngx";
import { AuthService } from "../services/auth.service";

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
  long: string;
  location: any;
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
    private firestoreService: AuthService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.loadMap();
    this.onSubmit();
    this.checkTrackingUpdate();
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
        });
      })
      .catch((error) => {
        console.log("Error getting location", error);
      });
    // alert('latitud' +this.lat+', longitud'+this.long )
  }

  onSubmit() {
    this.geolocation.getCurrentPosition().then((geposition: Geoposition) => {
      let lat = geposition.coords.latitude.toString();
      let long = geposition.coords.longitude.toString();
      this.auth
        .set_location("UPB", "-17.398797064290626", "-66.21835613799746")
        .then((auth) => {
          console.log(auth);
        })
        .catch((err) => console.log(err));
    });
  }
  checkTrackingUpdate() {
    this.database.collection("tracking").doc("update").valueChanges()
    .subscribe((val: any) => {if (val.actualizarBool=="true") {
      this.geolocation.getCurrentPosition().then((geposition: Geoposition) => {
        let lat = geposition.coords.latitude.toString();
        let long = geposition.coords.longitude.toString();
        console.log(lat,long)
        this.auth
          .update_location("motoN", lat, long)
          .then((auth) => {
            console.log(auth);
          })
          .catch((err) => console.log(err));
      });
    }});
  }
  //Add markers of sucursales 
  addSucursalMaker(itemMarker: MarkerOptions) {
    const marker = new google.maps.Marker({
      position: { lat: itemMarker.position.lat, lng: itemMarker.position.lng },
      map: this.map,
      title: itemMarker.name,
      text: itemMarker.address,
      img: itemMarker.image,
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
}
