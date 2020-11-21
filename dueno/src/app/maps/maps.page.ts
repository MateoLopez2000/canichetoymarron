import { Component, OnInit, NgZone, ElementRef, ViewChild } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { IonSlides, NavController, LoadingController } from '@ionic/angular';
import { GoogleMaps, MarkerOptions } from '@ionic-native/google-maps';
import { AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import * as firebase from 'firebase';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { FirestoreService } from '../services/data/firestore.service';

declare var google;

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
})
export class MapsPage implements OnInit {
  
  @ViewChild(IonSlides) slides: IonSlides;
  
  map : any;
  infoWindow : any;
  lat : string;
  long : string;  
  location : any;
  markerObj : any;
  markers: MarkerOptions[] = [ ];
  
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
    this.infoWindow = new google.maps.InfoWindow();
   }  
  
  ngOnInit() {
    this.loadMap();    
  }

  async loadMap() {
    const loading = await this.loadingCtrl.create();
    await loading.present();
    this.geolocation.getCurrentPosition().then((resp) => {
      let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      
      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      } 

      this.map = new google.maps.Map(document.getElementById('map'), mapOptions); 
      
      this.map.addListener('tilesloaded', () => {
        //this.lat = this.map.center.lat()
        //this.long = this.map.center.lng()
         loading.dismiss();
         this.loadMarkers();
        //this.getLocations();
      });
      google.maps.event
      .addListenerOnce(this.map, 'idle', () => {
        loading.dismiss();
      });
    }).catch((error) => {
      console.log('Error getting location', error);
    });
    
  }

  addMaker(itemMarker: MarkerOptions) {
    const marker = new google.maps.Marker({
      position: { lat: itemMarker.position.lat, lng: itemMarker.position.lng },
      map: this.map,
      title: itemMarker.title
    });
    return marker;
  }

  loadMarkers(){
    this.getLocations();
    this.markers.forEach(marker => {
      const markerObj = this.addMaker(marker);
      marker.markerObj = markerObj;
    });
  }

  async onSlideDidChange() {
    const currentSlide = await this.slides.getActiveIndex();
    const marker = this.markers[currentSlide];
    this.map.panTo({lat: marker.lat, lng: marker.lng});

    const markerObj = marker.markerObj;
    this.infoWindow.setContent(marker.title);
    this.infoWindow.open(this.map, markerObj);
  } 

  getLocations(){
    this.firestoreService.getData('sucursales').subscribe((sucursalesArray) => {
      this.markers = [];
      sucursalesArray.forEach((sucursal : any) => {
        this.markers.push({
          position : sucursal.position,
          image : sucursal.image,
          title :sucursal.title,
          text : sucursal.text
        });
      })
    });

    this.markers.forEach(marker => {
      console.log("Marker: " + marker.position.lat + " , " + marker.position.lng);
    })
  }

}
