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

  markers=[];
 
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
      this.lat = resp.coords.latitude.toString();
      this.long = resp.coords.longitude.toString();
      
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
      
      var marker = new google.maps.Marker({
        draggable: true,
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: latLng
      });

      this.markers.push(marker);
      //alert(this.markers[0].position)

      marker.addListener('dragend', () => {
        this.markers.push(marker);
        //alert(this.markers[this.markers.length-1].position);
        var res = this.markers[this.markers.length-1].position.toString().split("(");
        var res2= res[1].split(",");
        //console.log(" lat::"+res2[0]);
        var res3=res2[1].split(")")
        //console.log("long::"+res3[0]);
        this.lat = res2[0];
        this.long = res3[0];
      }); 
    }).catch((error) => {
      console.log('Error getting location', error);
    });

    // alert('latitud' +this.lat+', longitud'+this.long )

  }
  // latitud-17.398797064290626, longitud-66.21835613799746
}
