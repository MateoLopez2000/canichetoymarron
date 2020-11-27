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

  set_location(nombre: string, latitud: string, longitud: string) {
    return new Promise((resolve, reject) => {
      let uid = "KV30xDgmayGKyLN1T2Wm";
      this.db.collection("lugares").doc(uid).set({
        uid: uid,
        nombre: nombre,
        latitud: latitud,
        longitud: longitud,
      });
    });
  }
  getTrackingUpdate() {
    return this.db.collection("tracking").doc("update").get();
  }
  update_location(nombre: string, latitud: string, longitud: string) {
    return new Promise((resolve, reject) => {
      this.db.collection("lugares").doc(nombre).update({
        nombre: nombre,
        latitud: latitud,
        longitud: longitud,
      });
    });
  }

  public getSucursalesData(collection) {
    return this.db.collection(collection).valueChanges();
  }
}
