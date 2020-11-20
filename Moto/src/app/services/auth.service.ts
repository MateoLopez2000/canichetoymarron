import { environment } from './../../environments/environment.prod';
import { Injectable } from '@angular/core';
import {AngularFireAuth} from "@angular/fire/auth";
import { Router } from "@angular/router";
import { AngularFirestore, AngularFirestoreCollection } from "@angular/fire/firestore";
import { promise } from 'protractor';
import { resolve, reject } from 'q';
import * as firebase from 'firebase';
//import { firestore } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private AFauth : AngularFireAuth,
    private router: Router,
    private db: AngularFirestore) { }

     user = this.AFauth.currentUser;

    update_location(nombre:string, latitud:string,longitud:string)
    { return new Promise((resolve, reject) => {
      let id = "KV30xDgmayGKyLN1T2Wm"; 
      this.db.collection('lugares').doc(id).update({
            nombre: nombre,
            latitud: latitud,
            longitud: longitud
          });
        })  
    }
  }