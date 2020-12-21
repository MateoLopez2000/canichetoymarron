import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";
import {
  AngularFirestore,
} from "@angular/fire/firestore";

@Injectable({
  providedIn: "root",
})
export class GettersService {
  constructor() {
  }
  sucursales: any = [];

  public loadSucursales(sucursalesArray) {
    this.sucursales = [];
    sucursalesArray.forEach((sucursal: any) => {
      let sucursalData = sucursal.payload.doc.data();
      let sucursalID = sucursal.payload.doc.id;
      this.sucursales.push({
        id: sucursalID,
        position: {
          lat: Number(sucursalData.position.lat),
          lng: Number(sucursalData.position.lng),
        },
        name: sucursalData.name,
        address: sucursalData.address,
        telephone: sucursalData.telephone,
        attention: sucursalData.attention,
        imageURL: sucursalData.imageURL
      });
    });
    return this.sucursales;
  }
}
