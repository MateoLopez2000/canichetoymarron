import { Component, NgModule, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/auth'
import { AlertController } from '@ionic/angular';
import { AngularFirestore } from "@angular/fire/firestore";


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  user= {
    email: '',
    password: ''
  }

  constructor(
    private router: Router,
    private database: AngularFirestore, 
    public ngFireAuth: AngularFireAuth,
    private alertCtrl:AlertController
    ) { }

  ngOnInit() {
  }

  async login() {
    await this.ngFireAuth.signInWithEmailAndPassword(this.user.email, this.user.password).
    then(
      ()=>{
        this.database.collection("Motos").doc(this.user.email).update({estado: "disponible"});
        this.router.navigate(['/tabs/map']);
      },
      async error=> {
        const alert = await this.alertCtrl.create({
          message:error.message,
          buttons:[{text: 'ok',role:'cancel',handler:()=>{
          },},],
        },
        );
        await alert.present();
      }
    )
  }
  async resetPassword() {
    this.router.navigate(['/password-recovery']);
  }
}
