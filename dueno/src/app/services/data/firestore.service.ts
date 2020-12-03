import { Injectable } from "@angular/core";

import { AngularFirestore } from "@angular/fire/firestore";
import { Marker, MarkerOptions } from "@ionic-native/google-maps";

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
      estado: "disponible",
      rol: rol,
    });
  }

  public getRol(email) {
    return this.angularFirestore.collection("Motos").doc(email).valueChanges();
  }

  public getData(collection) {
    return this.angularFirestore.collection(collection).valueChanges();
  }
  public trackingUpdate(updateBool: string) {
    return new Promise((resolve, reject) => {
      this.angularFirestore.collection("tracking").doc("update").update({
        actualizarBool: updateBool,
      });
    });
  }

  public deleteData(sucursal) {
    return this.angularFirestore.doc("sucursales/" + sucursal).delete();
  }

  public updateData(collection, id, data) {
    return this.angularFirestore.collection(collection).doc(id).update(data);
  }
  public getMotos(collection) {
    return this.angularFirestore.collection(collection).valueChanges();
  }
  public getEspecificMoto(collection, email) {
    return this.angularFirestore.collection(collection).doc(email).valueChanges();
  }
}
