import { environment } from "./../../environments/environment.prod";
import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";
import {
  AngularFirestore,
} from "@angular/fire/firestore";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(
    private AFauth: AngularFireAuth,
    private router: Router,
    private db: AngularFirestore
  ) {}

  user = this.AFauth.currentUser;

  public getSucursales() {
    return this.db.collection("Sucursales").snapshotChanges();
  }
  public cerrarSesion() {
    return this.AFauth.signOut();
  }
  update_location(nombre: string, latitud: string, longitud: string) {
      this.db.collection("Motos").doc(nombre).update({
        position: {
          lat: latitud,
          lng: longitud
        },
    });
  }
  public getSucursalesData(collection) {
    return this.db.collection(collection).valueChanges();
  }
  public getEspecificMoto(collection, email) {
    return this.db.collection(collection).doc(email).valueChanges();
  }
  public updateEspecificlogin(collection, email) {
    this.db.collection(collection).doc(email).update({
      flogin: false,
    });
  }
}
