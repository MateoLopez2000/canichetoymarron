import { Component, OnInit } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { NavController } from '@ionic/angular';
import { GoogleMaps, MarkerOptions } from '@ionic-native/google-maps';
import { AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import * as firebase from 'firebase';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
})
export class MapsPage  {
  lat:number
  lon:number
  total:string

  constructor(
    public navCtrl: NavController,
    public geolocation: Geolocation,
    private googleMaps: GoogleMaps,  
    private db: AngularFirestore
   ) {
    this.getGeolocation();
    }

    async getGeolocation() {
      const  res = await this.geolocation.getCurrentPosition();
      const  position = {
        lat: res.coords.latitude,
        lng: res.coords.longitude
      };

      const mapElement: HTMLElement = document.getElementById('map');
      const map =  GoogleMaps.create(mapElement);
      console.log(mapElement);
  
    /*getGeolocation(){
      this.geolocation.getCurrentPosition().then((geoposition: Geoposition)=>{
        this.lat = geoposition.coords.latitude;
        this.lon = geoposition.coords.longitude;
      });
      console.log("Latitud " + this.geolocation);
*/
    }


}
