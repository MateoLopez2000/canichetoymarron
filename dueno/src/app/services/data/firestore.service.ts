import { Injectable } from "@angular/core";

import { AngularFirestore } from "@angular/fire/firestore";
import { Marker, MarkerOptions } from "@ionic-native/google-maps";
import { truncateSync } from 'fs';

@Injectable({
  providedIn: "root",
})
export class FirestoreService {
  constructor(private angularFirestore: AngularFirestore) {}
  
  public insertData(collection, id, latitud :number, longitud: number, nombre :string, direccion :string, telefono :number, horario :string, imagen :string){
    this.angularFirestore.doc(collection+'/'+id).set({
        position: {
          lat: latitud,
          lng: longitud
        },
        name: nombre,
        address: direccion,
        telephone: telefono,
        attention: horario,
        imageURL: imagen
    });
  }

  public insertMoto(collection, id, nombre, rol) {
    this.angularFirestore.doc(collection + '/' + id).set({ 
      position: {
        lat: 0,
        lng: 0
      },
      nombreDeMoto: nombre,
      estado: "ocupado",
      rol: rol,
      flogin: true,
    });
  }

  public getRol(email) {
    return this.angularFirestore.collection("Motos").doc(email).valueChanges();
  }
  public insertPedido(id) {
    this.angularFirestore.doc("pedidos" + '/' + id).set({ 
      position: {
        lat: "-17.34",
        lng: "-66.18",
      },
      estado: "Listo para recoger",
      direccion: "",
      fechahorapedido: "",
      nit: "",
      moto: "",
      nombre: "",
      productos: "",
      sucursal: "Suc1",
      telefono: "",
      total: ""});
  }
  public getData(collection) {
    return this.angularFirestore.collection(collection).valueChanges();
  }
  public trackingUpdate(updateBool: string) {
    this.angularFirestore.collection("tracking").doc("update").update({
      actualizarBool: updateBool,
    });
  }
  public getPedidos() {
    return this.angularFirestore.collection("pedidos").snapshotChanges();
  }
  public deleteData(sucursal) {
    return this.angularFirestore.doc("sucursales/" + sucursal).delete();
  }

  public updateData(collection, id, data) {
    return this.angularFirestore.collection(collection).doc(id).update(data);
  }
  public getMotos() {
    return this.angularFirestore.collection("Motos").snapshotChanges();
  }
  public getEspecificMoto(collection, email) {
    return this.angularFirestore.collection(collection).doc(email).valueChanges();
  }
}
