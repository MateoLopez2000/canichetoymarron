import {Component,OnInit,NgZone,Input,Output, EventEmitter} from "@angular/core";
import { Geolocation} from "@ionic-native/geolocation/ngx";
import {NavController,LoadingController, AlertController,} from "@ionic/angular";
import { GoogleMaps, MarkerOptions } from "@ionic-native/google-maps";
import {AngularFireStorage,AngularFireUploadTask,} from "@angular/fire/storage";
import {AngularFirestore,} from "@angular/fire/firestore";
import { Observable } from "rxjs";
import {} from "rxjs";
import { finalize, tap } from "rxjs/operators";
import {NativeGeocoder} from "@ionic-native/native-geocoder/ngx";
import { FirestoreService } from "../services/data/firestore.service";

declare var google;
let uid: any;

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
  selectedFile: any;
  markers = [];
  fromHour = new Date().toTimeString;
  toHour = new Date().toTimeString;
  sucursal_name: string;
  direction: string;
  telf: number;
  urlImage: any;

   @Input() path: string; 
   @Output() outcome = new EventEmitter<any>(true);

   task: AngularFireUploadTask;
   uploadProgress: Observable<any>;
   round = Math.round;
   fileToUpload: File;
   UploadedFireURL: Observable<string>;
   filesize: number; 
   isUploading = false;
   
  constructor(
    private geolocation: Geolocation,
    public zone: NgZone,
    public navCtrl: NavController,
    private googleMaps: GoogleMaps,
    private database: AngularFirestore,
    private nativeGeocoder: NativeGeocoder,
    private firestoreService: FirestoreService,
    private loadingCtrl: LoadingController,
    private fireStorage: AngularFireStorage,
    private alertCtrl: AlertController
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
          document.getElementById("map"),
          mapOptions
        );

        var marker = new google.maps.Marker({
          draggable: true,
          map: this.map,
          animation: google.maps.Animation.DROP,
          position: latLng,
        });

        this.markers.push(marker);
        //alert(this.markers[0].position)

        marker.addListener("dragend", () => {
          this.markers.push(marker);
          //alert(this.markers[this.markers.length-1].position);
          var res = this.markers[this.markers.length - 1].position
            .toString()
            .split("(");
          var res2 = res[1].split(",");
          //console.log(" lat::"+res2[0]);
          var res3 = res2[1].split(")");
          //console.log("long::"+res3[0]);
          this.lat = res2[0];
          this.long = res3[0];
        });
      })
      .catch((error) => {
        console.log("Error getting location", error);
      });
  }

  registerSucursal() {
    let name = this.sucursal_name;
    let address = this.direction;
    let telf = this.telf;
    let attention = this.fromHour + "-" + this.toHour;
    uid = name;
    this.addLocation(
      {
        position: {
          lat: Number(this.lat),
          lng: Number(this.long),
        },
          nombre : name,
          direccion : address,
          telefono : telf,
          horario : attention,
          imagen : this.urlImage
    });

    this.sucursal_name="";
    this.direction="";
    this.telf=null;
    this.fromHour=new Date().toTimeString;
    this.toHour=new Date().toTimeString;
  }
  
  addLocation(sucursal : MarkerOptions){
    this.firestoreService.insertData('sucursales', sucursal.position.lat, sucursal.position.lng, sucursal.nombre, sucursal.direccion, sucursal.telefono, sucursal.horario, sucursal.imagen);
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  uploadImage() {
    let filename = this.fileToUpload.name;
    const fullPath = `sucursalesImages/${filename}`;

    const fileref = this.fireStorage.ref(fullPath);

    const customMetadata = { app: "Upload image" };
    // Totally optional metadata
    this.task = this.fireStorage.upload(fullPath, this.fileToUpload, {
      customMetadata,
    });
    this.isUploading = true;
    this.task.catch((res) => {
      this.isUploading = false;
      console.log("Error uploading the file");
    });
    this.uploadProgress = this.task.percentageChanges();
    this.uploadProgress.subscribe( percentage => {
      console.log(percentage);
    }, err => {
      this.isUploading = false;
    });
    this.task.snapshotChanges().pipe(
      finalize(() => {
        this.UploadedFireURL = fileref.getDownloadURL();
        this.UploadedFireURL.subscribe( urlStr => {
          //created an object for sake of clarity
          this.urlImage = urlStr;
          const uploadOutcome = {
            hasUploaded: true,
            uploadUrl: urlStr
          };
          this.outcome.emit(uploadOutcome);
          this.isUploading = false;
          this.uploadDone();
          this.uploadProgress = null;
        });
      }),
      tap(snap => {
        this.filesize = snap.totalBytes;
      })
    ).subscribe( res => {
      console.log(res);
    })
  }
  async uploadDone() {
    const alert = await this.alertCtrl.create({
      message: "Image uploaded 😊",
      buttons: ["Ok"],
    });
    await alert.present();
  }
}
