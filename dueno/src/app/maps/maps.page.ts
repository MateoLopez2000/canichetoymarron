import { Component, OnInit, NgZone, ElementRef, ViewChild } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { NavController } from '@ionic/angular';
import { GoogleMaps, MarkerOptions } from '@ionic-native/google-maps';
import { AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import * as firebase from 'firebase';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';

declare var google;

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
})
export class MapsPage implements OnInit {
  map: any;
  lat: string;
  long: string;  
  location: any;
 
  constructor(
    private geolocation: Geolocation,
    public zone: NgZone,
    public navCtrl: NavController,
    private googleMaps: GoogleMaps,  
    private database: AngularFirestore,
    private nativeGeocoder: NativeGeocoder

  ) {
   }  
  
  ngOnInit() {
    this.loadMap();    
  }

  loadMap() {
    this.geolocation.getCurrentPosition().then((resp) => {
      let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      
      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      } 
  
      // let markerOptions: MarkerOptions = {
        // position: latLng,
        // title: 'Posición Actual',
        // icon: "/location.svg"
      //  };

      this.map = new google.maps.Map(document.getElementById('map'), mapOptions); 
      
      this.map.addListener('tilesloaded', () => {
        this.lat = this.map.center.lat()
        this.long = this.map.center.lng()
      }); 
    }).catch((error) => {
      console.log('Error getting location', error);
    });

    // alert('latitud' +this.lat+', longitud'+this.long )

  }
  // latitud-17.398797064290626, longitud-66.21835613799746
}
