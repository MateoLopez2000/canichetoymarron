import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private angularFirestore: AngularFirestore) { 
  }

  public insertData(collection, data){
    return this.angularFirestore.collection(collection).add(data);
  }

  public getData(collection){
    return this.angularFirestore.collection(collection).valueChanges();
  }
}