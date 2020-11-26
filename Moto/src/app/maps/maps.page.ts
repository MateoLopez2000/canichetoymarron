import {
  Component,
  OnInit,
  NgZone,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { Geolocation, Geoposition } from "@ionic-native/geolocation/ngx";
import { NavController } from "@ionic/angular";
import { GoogleMaps, MarkerOptions } from "@ionic-native/google-maps";
import {
  AngularFirestoreDocument,
  AngularFirestore,
} from "@angular/fire/firestore";
import * as firebase from "firebase";
import {
  NativeGeocoder,
  NativeGeocoderResult,
  NativeGeocoderOptions,
} from "@ionic-native/native-geocoder/ngx";
import { AuthService } from "../services/auth.service";

declare var google;

@Component({
  selector: "app-maps",
  templateUrl: "./maps.page.html",
  styleUrls: ["./maps.page.scss"],
})
export class MapsPage implements OnInit {
  map: any;
  lat: string;
  long: string;
  location: any;

  constructor(
    private geolocation: Geolocation,
    private zone: NgZone,
    public navCtrl: NavController,
    private googleMaps: GoogleMaps,
    private database: AngularFirestore,
    private nativeGeocoder: NativeGeocoder,
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

      // this.auth.register("UPB", this.lat, this.long).then(auth => {
      this.auth
        .set_location("UPB", "-17.398797064290626", "-66.21835613799746")
        .then((auth) => {
          console.log(auth);
        })
        .catch((err) => console.log(err));
    });
  }
  checkTrackingUpdate() {
    if (this.auth.getTrackingUpdate().toString() == "true") {
      this.geolocation.getCurrentPosition().then((geposition: Geoposition) => {
        let lat = geposition.coords.latitude.toString();
        let long = geposition.coords.longitude.toString();

        // this.auth.register("UPB", this.lat, this.long).then(auth => {
        this.auth
          .update_location("MotoN", this.lat, this.long)
          .then((auth) => {
            console.log(auth);
          })
          .catch((err) => console.log(err));
      });
    }
  }
}
