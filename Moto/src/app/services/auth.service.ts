import { environment } from "./../../environments/environment.prod";
import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from "@angular/fire/firestore";
import { promise } from "protractor";
import { resolve, reject } from "q";
import * as firebase from "firebase";

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
  getTrackingUpdate() {
    return this.db.collection("tracking").doc("update").get();
  }
  update_location(nombre: string, latitud: string, longitud: string) {
    return new Promise((resolve, reject) => {
      this.db.collection("Motos").doc(nombre).update({
        position: {
          lat: latitud,
          lng: longitud
        },
      });
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
