import { Observable } from 'rxjs';
import { Injectable } from "@angular/core";

import { AngularFirestore } from "@angular/fire/firestore";

@Injectable({
  providedIn: "root",
})
export class FirestoreService {
  constructor(private angularFirestore: AngularFirestore) {}
  
  public insertData(collection, latitud :number, longitud: number, nombre :string, direccion :string, telefono :number, horario :string, imagen :string){
    this.angularFirestore.doc(collection+'/'+ this.angularFirestore.createId()).set({
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

  public insertMoto(collection, id, nombre) {
    this.angularFirestore.doc(collection + '/' + id).set({ 
      position: {
        lat: 0,
        lng: 0
      },
      nombreDeMoto: nombre,
      estado: "ocupado",
      flogin: true,
    });
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
  public getMotoById(id)  {
    return this.angularFirestore.collection("Motos").doc(id).valueChanges();
  }
  public getData(collection) {
    return this.angularFirestore.collection(collection).valueChanges();
  }
  public getMotos() {
    return this.angularFirestore.collection("Motos").snapshotChanges();
  }
  public getPedidos() {
    return this.angularFirestore.collection("pedidos").snapshotChanges();
  }
  public getSucursales() {
    return this.angularFirestore.collection("sucursales").snapshotChanges();
  }
  public updateData(collection, id, data) {
    return this.angularFirestore.collection(collection).doc(id).update(data);
  }
  public getEspecificMoto(collection, email) {
    return this.angularFirestore.collection(collection).doc(email).valueChanges();
  }
}
