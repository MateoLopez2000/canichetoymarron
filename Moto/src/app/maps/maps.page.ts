import {Component,OnInit,NgZone,ViewChild} from "@angular/core";
import { Geolocation} from "@ionic-native/geolocation/ngx";
import { IonSlides,NavController, AlertController } from "@ionic/angular";
import { MarkerOptions } from "@ionic-native/google-maps";
import {AngularFirestore,} from "@angular/fire/firestore";
import { AuthService } from "../services/auth.service";
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from "@angular/router";

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
  user: any;
  infoWindow: any;
  markers: MarkerOptions[] = [];
  infoWindows: any = [];
  isTracking = false;
  watch = null;
  ocupado = false;

  constructor(
    private geolocation: Geolocation,
    public navCtrl: NavController,
    private database: AngularFirestore,
    public auth: AuthService,
    public ngFireAuth: AngularFireAuth,
    private firestoreService: AuthService,
    private alertController: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.getUser();
  }
  getUser() {
    this.ngFireAuth.authState.subscribe(res => {
      if (res && res.uid) {
        this.user = res.email;
        this.loadMap();
        this.listenNewOrder();
        this.startTracking();
      } else {
        this.router.navigateByUrl('');
        console.log('user not logged in');
      }
    });
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

        this.showClientLocation();
        this.loadMarkers();
        this.addMarker(latLng);

        this.map.addListener("tilesloaded", () => {
          this.lat = this.map.center.lat();
          this.long = this.map.center.lng();
          this.loadMarkers();
          this.addMarker(latLng);
          this.showClientLocation();
        });
      })
      .catch((error) => {
        console.log("Error getting location", error);
      });
  }
  startTracking() {
    this.isTracking = true;
    this.watch = this.geolocation.watchPosition();
    this.watch.subscribe((data)=>{
      this.auth
          .update_location(this.user, data.coords.latitude, data.coords.longitude)
    })
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
    this.firestoreService.getSucursalesData("Sucursales").subscribe((sucursalesArray) => {
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
    this.database.collection("Pedidos").valueChanges({ idField: 'pedidoId' })
    .subscribe((pedidos: any) => {
      pedidos.forEach(pedido => {
        if(this.ocupado){
          return
        }
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
          text: 'Rechazar (Se cerrará tu sesión)',
          handler: () => {
            this.database.collection("Motos").doc(this.user).update({estado: "ocupado"});
            this.ocupado = true;
            this.database.collection("Pedidos").doc(idPedido).update({estado: "Listo para recoger", moto: ""});
            this.router.navigateByUrl('');
          }
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.database.collection("Pedidos").doc(idPedido).update({estado: "En camino"});
            this.database.collection("Motos").doc(this.user).update({estado: "ocupado"});
            this.router.navigateByUrl('/tabs/pedidos');
          }
        }
      ]
    });
    await alert.present();
  }
  showClientLocation() {
      this.database.collection("Pedidos").valueChanges({ idField: 'pedidoId' })
      .subscribe((pedidos: any) => {
        pedidos.forEach(pedido => {
          if (pedido.estado == "En camino" && pedido.moto == this.user) {
            const order = new google.maps.Marker({
              position: { lat: Number(pedido.position.lat), lng: Number(pedido.position.lng) },
              map: this.map,
              icon : "../assets/icon/alfiler.png"
              });
          }
        });
      })
   }
   doRefresh(event) {
    this.loadMap();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}
