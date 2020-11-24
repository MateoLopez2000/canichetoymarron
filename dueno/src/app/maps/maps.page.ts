import { Component, OnInit, NgZone, ElementRef, ViewChild } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { IonSlides, NavController, LoadingController, Platform } from '@ionic/angular';
import { GoogleMaps, MarkerOptions } from '@ionic-native/google-maps';
import { AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import * as firebase from 'firebase';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { FirestoreService } from '../services/data/firestore.service';

declare var google;
let uid: any;

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
  fromHour=new Date().toTimeString;
  toHour=new Date().toTimeString;
  sucursal_name: string;
  direction: string;
  telf: number;
 
  constructor(
    private geolocation: Geolocation,
    public zone: NgZone,
    public navCtrl: NavController,
    private googleMaps: GoogleMaps,  
    private database: AngularFirestore,
    private nativeGeocoder: NativeGeocoder,
    private firestoreService: FirestoreService,
    private loadingCtrl: LoadingController
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
  }

  registerSucursal(){
    let name = this.sucursal_name;
    let address = this.direction;
    let telf = this.telf;
    let attention = this.fromHour + "-" + this.toHour;
    uid = name;

    this.addLocation({
      position : {
        lat : Number(this.lat), 
        lng : Number(this.long)
      },
      nombre : name,
      direccion : address,
      telefono : telf,
      horario : attention
    },uid);

    this.sucursal_name="";
    this.direction="";
    this.telf=null;
    this.fromHour=null;
    this.toHour=null;
  }
  
  addLocation(sucursal : MarkerOptions, uid : any){
    this.firestoreService.insertData('sucursales', uid, sucursal.position.lat, sucursal.position.lng, sucursal.nombre, sucursal.direccion, sucursal.telefono, sucursal.horario);
  }
}
